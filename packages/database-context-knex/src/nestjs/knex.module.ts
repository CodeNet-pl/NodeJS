import { Logger } from '@code-net/logging';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { Knex } from 'knex';
import {
  KnexMaster,
  KnexSchema,
  MigrationSource,
  TsMigrationSource,
  createKnex,
} from '../index';

export type KnexModuleOptions = {
  /**
   * Connection string to the database.
   * Format:
   *   <protocol>://<username>:<password>@<hostname>:<port>/<database>
   * Eg.
   *  postgres://username:topsecret@myhost.com:5432/mydatabase
   *
   * For encrypted connection add "s" to the protocol, eg:
   *  postgress://username:topsecret@myhost.com:5432/mydatabase
   */
  connection: string | Knex.Config | Knex;

  migrationSource?: MigrationSource<unknown>;
  migrationDirectory?: string;
  createDatabase?: boolean;
};

@Module({})
export class KnexModule {
  public static forRoot(options: KnexModuleOptions): DynamicModule {
    @Module({})
    @Global()
    class KnexRootModule {
      constructor(private master: KnexMaster) {}

      async onModuleInit() {
        if (options.migrationSource) {
          await this.master.migrate({
            migrationSource: options.migrationSource,
            migrationDirectory: options.migrationDirectory,
            schemaName: 'public',
          });
        }
      }

      async onApplicationShutdown() {
        await this.master.destroy();
      }
    }

    return {
      module: KnexRootModule,
      providers: [
        {
          provide: KnexMaster,
          inject: [Logger],
          useFactory: async (logger: Logger) => {
            if (options.createDatabase) {
              const conn = createKnex(options.connection, logger);
              const database = conn.client.config.connection.database;
              conn.client.config.connection.database = 'postgres';

              const result = await conn.raw(
                `SELECT 1 FROM pg_database WHERE datname = '${database}'`
              );

              if (result.rows.length === 0) {
                await conn.raw(`CREATE DATABASE ${database}`).catch((err) => {
                  logger.error(err);
                  return;
                });
              }

              await conn.destroy();
            }

            return new KnexMaster(options.connection, logger);
          },
        },
      ],
      exports: [KnexMaster],
    };
  }

  public static forSchema(options: {
    schemaName: string;
    migrations?: {
      directory: string;
      source?: MigrationSource<unknown>;
      tableName?: string;
      schemaName?: string;
    };
  }): DynamicModule {
    @Module({})
    class KnexSchemaModule {
      constructor(private schema: KnexSchema) {}

      async onModuleInit() {
        if (options.migrations) {
          if (options.migrations.source) {
            await this.schema.migrate({
              migrationSource: options.migrations.source,
              tableName: options.migrations.tableName || 'knex_migrations',
            });
          } else if (options.migrations.directory) {
            await this.schema.migrate({
              tableName: options.migrations.tableName || 'knex_migrations',
              migrationSource: new TsMigrationSource(
                options.migrations.directory
              ),
            });
          }
        }
      }
    }

    return {
      module: KnexSchemaModule,
      providers: [
        {
          provide: KnexSchema,
          useFactory: (master: KnexMaster) => master.schema(options.schemaName),
          inject: [KnexMaster],
        },
      ],
      exports: [KnexSchema],
    };
  }
}
