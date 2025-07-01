import { LogLevel, Logger } from '@code-net/logging';
import { Knex } from 'knex';

export class KnexLogger {
  constructor(
    private readonly logger: Logger,
    private readonly knex: Knex,
  ) {}

  listen() {
    const times: Record<string, [number, number]> = {};
    const getDuration = (uid: string): number => {
      const start = times[uid];
      const stop = process.hrtime(start);
      return Math.round((stop[0] * 1e6 + stop[1]) / 1e6);
    };

    this.knex
      .on('query', (query) => {
        const { __knexQueryUid } = query;
        times[__knexQueryUid] = process.hrtime();
        if (!__knexQueryUid) {
          // Most likely BEGIN/COMMIT/ROLLBACK
          this.logger.debug(query.sql, { trxId: query.__knexTxId });
        }
      })
      .on('query-error', (error: Error, query) => {
        const { sql, bindings, __knexQueryUid, __knexTxId } = query;
        const duration = getDuration(__knexQueryUid);
        this.logger.warning(`${sql}`, {
          trxId: __knexTxId,
          duration,
          bindings,
          error,
        });
        delete times[__knexQueryUid];
      })
      .on('query-response', (response, query) => {
        const { sql, bindings, __knexQueryUid, __knexTxId } = query;
        const duration = getDuration(__knexQueryUid);

        let level: LogLevel = 'debug';
        if (duration > 500) {
          level = 'notice';
        } else if (duration > 100) {
          level = 'info';
        }

        const pool = this.knex.client.pool;
        this.logger.log(level, `${sql}`, {
          trxId: __knexTxId,
          duration,
          bindings,
          pool: { used: pool.used.length, max: pool.max },
        });
        delete times[__knexQueryUid];
      });
  }
}
