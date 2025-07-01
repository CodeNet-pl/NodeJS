import type { TransactionOptions } from '@code-net/database-context';
import { ConcurrencyError, PersistenceError } from '@code-net/errors';
import { Logger, MockLogger } from '@code-net/logging';
import { AsyncLocalStorage } from 'async_hooks';
import { Knex } from 'knex';
import { setTimeout } from 'timers/promises';
import { createKnex } from './knex-factory';
import { KnexSchema } from './knex-schema';

export class UniqueConstraintViolation extends PersistenceError {}

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
 * Knex master connection that can be used across modules.
 */
export class KnexMaster {
  private schemas: { [key: string]: KnexSchema } = {};
  private knex: Knex;

  constructor(
    private readonly connectionOptions: string | Knex.Config,
    private logger: Logger = new MockLogger()
  ) {
    this.knex = createKnex(connectionOptions, logger);
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
    let schemaOptions: Knex.Config | string = this.connectionOptions;
    if (typeof this.connectionOptions === 'string') {
      const url = new URL(this.connectionOptions);
      url.searchParams.set('searchPath', options.schemaName);
      schemaOptions = url.toString();
    } else {
      schemaOptions = {
        ...this.connectionOptions,
        searchPath: options.schemaName,
      };
    }
    const child = createKnex(schemaOptions, this.logger);
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
