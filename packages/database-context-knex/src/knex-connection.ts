import { PersistenceError } from '@code-net/errors';
import { KnexMaster } from './knex-master';
import { KnexSchema } from './knex-schema';

export class UniqueConstraintViolation extends PersistenceError {}

export class KnexConnection {
  constructor(
    private readonly knex: KnexMaster,
    private readonly schema: string
  ) {}

  public async transaction<T>(
    cb: (knex: KnexSchema) => Promise<T>
  ): Promise<T> {
    return this.knex.transaction(() => {
      return this.wrapErrors(cb)(new KnexSchema(this.knex, this.schema));
    });
  }

  public async query<T>(cb: (knex: KnexSchema) => Promise<T>): Promise<T> {
    return this.knex.transaction(() => {
      return this.wrapErrors(cb)(new KnexSchema(this.knex, this.schema));
    });
  }

  private wrapErrors<T>(
    cb: (knex: KnexSchema) => Promise<T>
  ): (knex: KnexSchema) => Promise<T> {
    return (knex: KnexSchema) =>
      cb(knex).catch((e) => {
        if (e instanceof Error && (e as any).code === '23505') {
          throw new UniqueConstraintViolation(e.message);
        }
        throw new UniqueConstraintViolation(e.message);
      });
  }
}
