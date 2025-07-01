import { readdirSync } from 'fs';
import { basename } from 'path';
import { Migration, MigrationSource } from '../knex-master';

export function context(path: string, deep?: boolean, filter?: RegExp) {
  // Implement Webpack require.context for Jest
  const files = readdirSync(path);
  const module = (key: string) => require(`${path}/${key}`);
  module.keys = () => files;
  return module;
}

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
