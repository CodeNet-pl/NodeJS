import { DatabaseContext } from './database-context';

export class InMemoryDatabaseContext<T> implements DatabaseContext<T> {
  constructor(private readonly context: T) {}

  transaction<TReturn>(cb: (uow: T) => Promise<TReturn>): Promise<TReturn> {
    return cb(this.context);
  }

  read<TReturn>(cb: (uow: T) => Promise<TReturn>): Promise<TReturn> {
    return cb(this.context);
  }
}
