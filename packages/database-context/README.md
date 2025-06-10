# database-context

This library provides an abstraction over database context and decorator to enlist method calls in a transaction.

## Usage

To show an example lets use an in-memory implementation which comes with this package.

```typescript
import { InMemoryDatabaseContext, Transactional } from '@code-net/database-context';


class MyService {
  constructor(private dbContext: DatabaseContext, private otherService: OtherService) {}

  @Transactional()
  async someMethod() {
    await this.otherService.otherMethod();
  }
}

class OtherService {
  @Transactional()
  async otherMethod() {
    // some logic
  }
}

const dbContext = new InMemoryDatabaseContext();
const myService = new MyService(dbContext, new OtherService());

await myService.someMethod(); // This will execute in a transaction
// Note that the OtherService's otherMethod will also be executed in the same transaction
```

**Important**: The decorator expects that the class has exactly one DatabaseContext instance property.

You can skip enlisting in the same transaction by passing options argument to the `Transactional` decorator:

```typescript
class MyService {
  @Transactional({
    independent: true, // This method will not be part of any transaction
    isolationLevel: 'read committed', // Optional isolation level
  })
  async someMethod() {
    // some logic
  }
}
```

It is also possible to manually start the transaction.

```typescript
import { DatabaseContext } from '@code-net/database-context';

const dbContext: DatabaseContext();

const result = await dbContext.transaction(async () => {
  // Your transactional logic here
  return 'result';
}, {
  independent: false, // This transaction should run in a separate transaction
  isolationLevel: 'read committed', // Optional isolation level
});
```

Implementations of `DatabaseContext` should use async hooks to manage the transaction state.
