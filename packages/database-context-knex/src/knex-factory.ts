import { Logger } from '@code-net/logging';
import { knex, Knex } from 'knex';
import { KnexLogger } from './knex-logger';

export function parseConnection(connectionString: string) {
  const { protocol, hostname, port, pathname, username, password, search } =
    new URL(encodeURI(connectionString));
  const database = pathname?.replace(/^\//, '');
  const client = protocol?.replace(/s?:$/, ''); // Remove "s:" from eg. "mssqls:"
  const options: any = Object.fromEntries(
    new URLSearchParams(search.substring(1))
  );

  const connection = {
    ...options,
    host: hostname,
    port: port ? parseInt(port, 10) : undefined,
    user: username,
    password,
    database,
  };
  return {
    ...options,
    client,
    connection,
    pool: {
      min: 1,
      max: 10,
      acquireTimeoutMillis: 10000,
      ...(options.pool ?? {}),
    },
    acquireConnectionTimeout: 10000,
  };
}

export function createKnex(
  connectionString: string | Knex.Config,
  logger?: Logger
) {
  const options =
    typeof connectionString === 'string'
      ? parseConnection(connectionString)
      : connectionString;
  const conn = knex(options);
  if (logger) {
    new KnexLogger(logger, conn).listen();
  }
  return conn;
}
