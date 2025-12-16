import {
  DatabaseContext,
  TransactionOptions,
} from '@code-net/database-context';
import { Knex } from 'knex';
import { KnexMaster, MigrationSource } from './knex-master';
import { TsMigrationSource } from './migration-source';

export type KnexDatabaseContextOptions = {
  migrations?: {
    directory?: string;
    source?: MigrationSource<unknown>;
    tableName?: string;
  };
};

export class KnexSchema implements DatabaseContext {
  constructor(
    protected master: KnexMaster,
    readonly schema: string,
    protected options: KnexDatabaseContextOptions = {}
  ) {}

  read<TReturn>(cb: (context?: unknown) => Promise<TReturn>): Promise<TReturn> {
    return this.transaction(cb); // TODO: Skip transactions
  }

  public transaction<T>(
    cb: (knex: Knex.QueryBuilder) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    return this.master.transaction(
      (trx) => cb(trx.withSchema(this.schema)),
      options
    );
  }

  public table<T>(tableName: string) {
    return this.master
      .getKnexOrTransaction()
      .withSchema(this.schema)
      .table<any, T>(tableName)
      .timeout(30000, { cancel: true });
  }

  public fromRaw<T extends {}>(value: string) {
    return this.master.getKnexOrTransaction().fromRaw<T>(value);
  }

  public raw<T>(value: string, bindings: Knex.RawBinding[] = []) {
    return this.master.getKnexOrTransaction().raw<T>(value, bindings);
  }

  public ref(ref: string) {
    return this.master.getKnexOrTransaction().ref(ref);
  }

  async migrate(options?: {
    tableName?: string;
    migrationSource?: MigrationSource<unknown>;
    migrationDirectory?: string;
  }) {
    const opts = {
      directory:
        options?.migrationDirectory ?? this.options?.migrations?.directory,
      tableName: options?.tableName ?? this.options?.migrations?.tableName,
      source: options?.migrationSource ?? this.options?.migrations?.source,
    };

    if (!opts.source && !opts.directory) {
      throw new Error('Migration source or directory must be provided');
    }
    await this.master.migrate({
      migrationSource: opts.directory
        ? new TsMigrationSource(opts.directory)
        : opts.source,
      schemaName: this.schema,
    });
  }
}
