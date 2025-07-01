import type { TransactionOptions } from '@code-net/database-context';
import { ConcurrencyError } from '@code-net/errors';
import { Logger, MockLogger } from '@code-net/logging';
import { AsyncLocalStorage } from 'async_hooks';
import { Knex } from 'knex';
import { setTimeout } from 'timers/promises';
import { KnexConnection, UniqueConstraintViolation } from './knex-connection';
import { createKnex } from './knex-factory';
import { KnexSchema } from './knex-schema';

type TransactionStore = {
  trxPromise?: Promise<Knex.Transaction>;
  trx?: Knex.Transaction;
  count: number;
  retries: number;
  error?: unknown;
};
const asyncStorage: AsyncLocalStorage<TransactionStore> =
  new AsyncLocalStorage();

/**
 * Knex master connection that can be used cross modules.
 * This should not be used directly, use KnexConnection instead.
 */
export class KnexMaster {
  private schemas: { [key: string]: KnexSchema } = {};
  private connections: { [key: string]: KnexConnection } = {};
  private knex: Knex;

  constructor(
    private readonly connectionString: string,
    private logger: Logger = new MockLogger()
  ) {
    this.knex = createKnex(connectionString, logger);
  }

  getKnexOrTransaction(): Knex.Transaction | Knex {
    const store = asyncStorage.getStore();
    if (!store) {
      return this.knex;
    }
    if (!store.trx) {
      throw new Error('Transaction did not start');
    }

    return store.trx;
  }

  public async transaction<T>(
    cb: (knex: Knex.Transaction) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    let store = asyncStorage.getStore();
    if (
      options?.independent ||
      !store ||
      (store.trxPromise === undefined && store.trx === undefined)
    ) {
      store = {
        trxPromise: this.knex.transaction(),
        count: 1,
        retries: store?.retries ?? 0,
      };
      return asyncStorage.run(store, async () => {
        if (!store) {
          throw new Error('Transaction store is not initialized');
        }
        const trx: Knex.Transaction = await store.trxPromise!;
        store.trx = trx;
        try {
          const result = await cb(trx);
          if (
            store.error &&
            store.error instanceof Error &&
            // Assuming database error
            typeof (store.error as any).code === 'string'
          ) {
            // if there was an error in the nested transaction, we should throw it
            throw store.error;
          } else {
            await trx.commit();
            store.trxPromise = undefined;
            store.trx = undefined;
          }
          store.error = undefined;
          return result;
        } catch (e) {
          this.logger.error(
            `ROLLBACK: ${e instanceof Error ? e.stack : undefined}`
          );
          await trx.rollback(e instanceof Error ? e : undefined);
          store.trxPromise = undefined;
          store.trx = undefined;
          store.error = e;
          if (
            e instanceof ConcurrencyError ||
            (e instanceof Error && (e as any).code === '23505')
          ) {
            if (store.retries < 3) {
              store.retries += 1;
              this.logger.warning('RETRY TRANSACTION');
              await setTimeout(100 * store.retries + Math.random() * 100);
              return this.transaction(cb);
            }
            throw new UniqueConstraintViolation(e.message);
          }
          throw e;
        } finally {
          store.count -= 1;
        }
      });
    } else {
      store.count += 1;
      try {
        return await cb(store.trx ? store.trx : await store.trxPromise!);
      } catch (e) {
        store.error = e;
        throw e;
      } finally {
        store.count -= 1;
      }
    }
  }

  connection(name: string) {
    if (!this.connections[name]) {
      this.connections[name] = new KnexConnection(this, name);
    }
    return this.connections[name];
  }

  schema(schema: string) {
    if (!this.schemas[schema]) {
      this.schemas[schema] = new KnexSchema(this, schema);
    }

    return this.schemas[schema];
  }

  async migrate(options: {
    migrationSource?: MigrationSource<unknown>;
    migrationDirectory?: string;
    schemaName: string;
  }) {
    await this.knex.raw(`CREATE SCHEMA IF NOT EXISTS ${options.schemaName}`);
    const url = new URL(this.connectionString);
    url.searchParams.set('searchPath', options.schemaName);

    const child = createKnex(url.toString());
    await child.migrate
      .latest({
        migrationSource: options.migrationSource,
        directory: options.migrationDirectory,
        schemaName: options.schemaName,
      })
      .finally(() => child.destroy());
  }
}

export interface Migration {
  up: (knex: Knex) => PromiseLike<void>;
  down?: (knex: Knex) => PromiseLike<void>;
}

export interface MigrationSource<TMigrationSpec> {
  getMigrations(loadExtensions: readonly string[]): Promise<TMigrationSpec[]>;
  getMigrationName(migration: TMigrationSpec): string;
  getMigration(migration: TMigrationSpec): Promise<Migration>;
}
