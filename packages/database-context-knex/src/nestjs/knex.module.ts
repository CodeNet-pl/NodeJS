import { Logger } from '@code-net/logging';
import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  KnexMaster,
  KnexSchema,
  MigrationSource,
  TsMigrationSource,
  createKnex,
  parseConnection,
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
  connection: string;

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
    }
    return {
      module: KnexRootModule,
      providers: [
        {
          provide: KnexMaster,
          inject: [Logger],
          useFactory: async (logger: Logger) => {
            if (options.createDatabase) {
              const { connection } = parseConnection(options.connection);
              const conn = createKnex(
                options.connection.replace(/\/[^/]*$/, '/postgres'),
                logger
              );

              const result = await conn.raw(
                `SELECT 1 FROM pg_database WHERE datname = '${connection.database}'`
              );

              if (result.rows.length === 0) {
                await conn
                  .raw(`CREATE DATABASE ${connection.database}`)
                  .catch((err) => {
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
    schema: string;
    migrationSource?: MigrationSource<unknown>;
    migrationDirectory?: string;
  }): DynamicModule {
    @Module({})
    class KnexSchemaModule {
      constructor(private schema: KnexSchema) {}

      async onModuleInit() {
        if (options.migrationSource) {
          await this.schema.migrate({
            migrationSource: options.migrationSource,
            migrationDirectory: options.migrationDirectory,
          });
        } else if (options.migrationDirectory) {
          await this.schema.migrate({
            migrationSource: new TsMigrationSource(options.migrationDirectory),
            migrationDirectory: options.migrationDirectory,
          });
        }
      }
    }

    return {
      module: KnexSchemaModule,
      providers: [
        {
          provide: KnexSchema,
          useFactory: (master: KnexMaster) => master.schema(options.schema),
          inject: [KnexMaster],
        },
      ],
      exports: [KnexSchema],
    };
  }
}
