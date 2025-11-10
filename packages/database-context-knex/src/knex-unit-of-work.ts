import {
  DatabaseContext,
  TransactionOptions,
} from '@code-net/database-context';
import { KnexSchema } from './knex-schema';

export class KnexUnitOfWork<TContext> implements DatabaseContext<TContext> {
  constructor(private schema: KnexSchema, private readonly context: TContext) {}

  transaction<TReturn>(
    cb: (context?: TContext) => Promise<TReturn>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: TransactionOptions
  ): Promise<TReturn> {
    return this.schema.transaction(() => cb(this.context));
  }

  read<TReturn>(
    cb: (context?: TContext) => Promise<TReturn>
  ): Promise<TReturn> {
    return this.schema.read(() => cb(this.context));
  }
}
