# @code-net/identity

Lightweight UUID helpers on top of `uuid`, plus a type-safe `Uuid` value object for application identifiers.

## Why use it

- Thin, tree-shakeable wrapper over `uuid`
- Friendly `Uuid` class with helpers and equality checks
- Optional branded subclasses for type-safe IDs (e.g. `UserId`, `OrderId`)
- Ready for v4, v5, and v7 UUIDs

## Install

```bash
pnpm add @code-net/identity
# or npm/yarn
```

## Quick start

Generate UUIDs directly:

```ts
import { uuid } from '@code-net/identity';

const idv4 = uuid.v4();
const idv7 = uuid.v7();

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const idv5 = uuid.v5('some string', NAMESPACE);
```

Work with the `Uuid` class:

```ts
import { Uuid } from '@code-net/identity';

const id1 = new Uuid();            // defaults to v7
const id2 = new Uuid(id1.uuid);    // build from a string

id1.toV5('some string');           // derive a v5 using this instance as namespace
id1.equals(id2);                   // strict comparison

id1.toString(); // "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
id1.toJSON();   // serializes as plain string
id1.uuid;       // explicit string access
```

Create branded, type-safe IDs:

```ts
import { Uuid } from '@code-net/identity';

class UserId extends Uuid<'User'> {}
class ProductId extends Uuid<'Product'> {}

const userId = new UserId();
const productId = new ProductId();

// @ts-expect-error: different brands, prevents cross-assignments
const bad: UserId = productId;
```

## API notes

- `uuid`: Direct re-export of `uuid` functions (`v4`, `v5`, `v7`).
- `Uuid`:
  - `constructor(value?: string)`: new random v7 by default, or wrap an existing UUID string.
  - `toV5(value: string)`: produce a v5 UUID using this instance as namespace.
  - `equals(other: Uuid)`: strict equality by value.
  - `uuid`, `toString()`, `toJSON()`, `valueOf()`: string accessors.
