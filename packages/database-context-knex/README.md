# database-context-knex

This package implements `@code-net/database-context` interface using Knex.js.

Additionally it aids scoping your modules to a specific database schema while reusing the same connection. The single connection is used to span transaction across multiple application modules.

## Usage

```typescript
import { KnexMaster } from '@code-net/database-context-knex';

// Create master instance with knex options passed as query string parameters
const master = new KnexMaster('pg://localhost:5432/mydb?pool[min]=4');
// or with a Knex configuration object
// const master = new KnexMaster({ knex options here });

// Use the master instance to create a schema context
const schema = master.schema('myschema');

// Use the schema context to query data using knex query builder like API

await schema.transaction(async () => {
  const users = await schema.table('users').select('*');
  // SELECT * FROM myschema.users;
})
```

### NestJS

If you are using NestJS, you can use the `KnexModule` to register the master instance as a provider.

```typescript
import { KnexModule } from '@code-net/database-context-knex/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    KnexModule.forRoot({
      connection: 'pg://localhost:5432/mydb?pool[min]=4',
    }),
  ],
})
```

Then in each and every module you can register schema context

```typescript
import { KnexModule } from '@code-net/database-context-knex/nestjs';
import { Module, Injectable } from '@nestjs/common';

@Module({
  imports: [
    KnexModule.forSchema('myschema'),
  ],
  providers: [MyService],
})
export class MyModule {}

@Injectable()
class MyService {
  constructor(private readonly schema: KnexSchema) {}

  @Transactional()
  async getUsers() {
    return this.schema.table('users').select('*'); // SELECT * FROM myschema.users;
  }
}
```
