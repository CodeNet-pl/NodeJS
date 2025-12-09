import { Logger } from '@code-net/logging';
import { knex, Knex } from 'knex';
import { KnexLogger } from './knex-logger';

function isKnexInstance(connection: unknown): connection is Knex {
  return (
    typeof connection === 'object' &&
    connection !== null &&
    typeof (connection as Knex).raw === 'function' &&
    typeof (connection as Knex).select === 'function'
  );
}

export function createKnex(
  connection: string | Knex.Config | Knex,
  logger?: Logger
) {
  const conn: Knex = isKnexInstance(connection) ? connection : knex(connection);
  if (logger) {
    new KnexLogger(logger, conn).listen();
  }
  return conn;
}
