import * as fs from 'fs';
import { Knex } from 'knex';
import * as path from 'path';

/**
 * Migration source which ensures migration names are stored in database with .ts extension
 * even if they are .js files
 */
export class TsMigrationSource implements Knex.MigrationSource<unknown> {
  constructor(private migrationsDir: string) {}

  async getMigrations() {
    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((file) => /\.(ts|js)$/.test(file))
      .map((file) => file.replace(/\.(ts|js)$/, '.ts'));

    return files.sort();
  }

  getMigrationName(file: string) {
    return file;
  }

  getMigration(file: string) {
    return require(path.join(this.migrationsDir, file.replace(/\.ts$/, '')));
  }
}
