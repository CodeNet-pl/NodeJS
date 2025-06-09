# Identity

This package contains a wrapper for `uuid` package to ease the generation of UUIDs.

In future it will also wrap other packages like `nanoid`.

## Usage

Basic low level usage:

```ts
import { uuid } from '@code-net/identity';

const idv4 = uuid.v4();

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Example namespace for v5 UUIDs
const idv5 = uuid.v5('some string', NAMESPACE);
```

Usage of `Uuid` class:

```ts
import { Uuid } from '@code-net/identity';
const id1 = new Uuid(); // Generates a v4 UUID via uuid package

id1.toV5('some string'); // Converts the UUID to a v5 UUID using this uuid as namespace

const id2 = new Uuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8'); // Creates a Uuid from a string

console.log(id1.equals(id2)); // True or false


id.toString(); // Returns the UUID as a string
id.toJSON(); // Serializes to JSON as plain string
id.valueOf(); // Returns the UUID as a string
id.uuid; // Explicit way to access the UUID string
```

Creating value objects:

```ts
import { Uuid } from '@code-net/identity';

class UserId extends Uuid<'User'> {}
class ProductId extends Uuid<'Product'> {}

let userId = new UserId();
let productId = new ProductId();

userId = productId; // This will fail type checking
```
