import { basename } from 'path';
import { Migration, MigrationSource } from '../knex-master';

export class WebpackMigrationSource implements MigrationSource<unknown> {
  constructor(private migrationContext: any) {}

  getMigrations() {
    return Promise.resolve(this.migrationContext.keys().sort());
  }

  getMigrationName(migration: string): string {
    return basename(migration);
  }

  async getMigration(migration: string): Promise<Migration> {
    return this.migrationContext(migration);
  }
}
