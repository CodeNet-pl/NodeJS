# Multi-Tenancy

The `multi-tenancy` package provides utilities for managing tenant-specific contexts in a Node.js application. It ensures that operations are executed within the correct tenant context and provides hooks for handling tenant lifecycle events.

## Installation

Install the package using your preferred package manager:

```bash
pnpm install @code-net/multi-tenancy
```

## Features

- **Tenant Context Management**: Run operations within a specific tenant context.
- **Lifecycle Event Hooks**: Listen to tenant context creation and destruction events.
- **Error Handling**: Provides custom errors for missing or mismatched tenant contexts.

## Usage

Before you can resolve tenant ID or name, you need to run your code within a tenant context. You can do this using the `withTenant` function.

If you use `express`, you can create a middleware to set the tenant context for each request.

```typescript
import { withTenant } from '@code-net/multi-tenancy';

const app = express();
app.use((req, res, next) => {
  // Resolve the tenant whatever way you want
  // Here we assume the tenant ID and name are passed in headers
  const tenantId = req.headers['x-tenant-id'];
  const tenantName = req.headers['x-tenant-name'];
  if (!tenantId || !tenantName) {
    return res.status(400).send('Missing tenant information');
  }
  withTenant({ id: tenantId as string, name: tenantName as string }, next);
});
```

After this is done, you can use `getTenant()` or `getTenantId()` / `getTenantName()` anywhere in the request handling code to get the current tenant's ID and name.

## Use cases

### Database per tenant with Knex

```typescript
import knex, { Knex } from 'knex';
import { onTenantContext, getTenantId } from '@code-net/multi-tenancy';

const databases: Record<string, Knex> = {};
onTenantContext('created', async (tenant) => {
  if (databases[tenant.id]) {
    // Already created
    return;
  }
  // If you have a tenant catalog, you might want to fetch connection info here
  databases[tenant.id] = knex('postgres://host/' + tenant.name);
});

export function getKnex(): Knex {
  const tenantId = getTenantId();
  const db = databases[tenantId];
  if (!db) {
    throw new Error(`No database connection for tenant ${tenantId}`);
  }
  return db;
}
// Use getKnex() to get the Knex instance for the current tenant
```

### Row Level Security with PostgreSQL and Knex

```typescript
import knex from 'knex';
import { getTenantId } from '@code-net/multi-tenancy';

const db = new knex('postgres://host/dbname');

await db.transaction(async (trx) => {
  // Whenever you start a transaction, set the tenant_id for the transaction connection
  // This assumes you have a PostgreSQL RLS policy that uses app.tenant_id
  await trx.raw(`SET app.tenant_id = ?`, [getTenantId()]);
  // Now you can use trx for all your queries within this tenant context
  // trx('table').select('*').where(...);
  // trx('table').insert({ ...
});
```

### Row Level Security with PostgreSQL and Knex with DatabaseContext

```typescript
import { getTenantId } from '@code-net/multi-tenancy';
import { KnexMaster } from '@code-net/database-context-knex';

const master = new KnexMaster('postgres://user:pass@host/dbname');

await master.on('transaction', async (trx) => {
  // Whenever you start a transaction, set the tenant_id for the transaction connection
  // This assumes you have a PostgreSQL RLS policy that uses app.tenant_id
  await trx.raw(`SET app.tenant_id = ?`, [getTenantId()]);
});

// Use the master instance as usual, it will automatically handle RLS for the current tenant
```

### Database per tenant with Sequelize

```typescript
import { Sequelize } from 'sequelize';
import { onTenantContext, getTenantId } from '@code-net/multi-tenancy';

const databases: Record<string, Sequelize> = {};
onTenantContext('created', async (tenant) => {
  if (databases[tenant.id]) {
    // Already created
    return;
  }
  // If you have a tenant catalog, you might want to fetch connection info here
  databases[tenant.id] = new Sequelize(
    `postgres://host/${tenant.name}`,
  );
  // define your models here or register them with another call to `onTenantContext('created', ...)`
});

export function getConnection() {
  const tenantId = getTenantId();
  const db = databases[tenantId];
  if (!db) {
    throw new Error(`No database connection for tenant ${tenantId}`);
  }
  return db;
}

// Use getConnection() to get the Sequelize instance for the current tenant
```

## API

### `withTenant(tenant: TenantContext, callback: (tenant: TenantContext) => Promise<T>): Promise<T>`

Runs the provided callback within the specified tenant context.

#### Parameters

- `tenant`: An object containing the tenant's `id` and `name`.
- `callback`: An asynchronous function to execute within the tenant context.

#### Example

```typescript
await withTenant({ id: '1', name: 'test' }, async () => {
  console.log('Running within tenant context');
});
```

### `getTenant(): TenantContext`

Retrieves the current tenant context.

#### Throws

- `TenantContextNotFound` if no tenant context is active.

#### Example

```typescript
const tenant = getTenant();
console.log(tenant);
```

### `hasTenant(): boolean`

Checks if a tenant context is active.

#### Example

```typescript
if (hasTenant()) {
  console.log('Tenant context is active');
}
```

### `onTenantContext(event: TenantContextEvent, callback: (tenant: TenantContext) => Promise<void>)`

Registers a callback for tenant lifecycle events.

#### Parameters

- `event`: The event to listen for (`'created'`, `'entered'`, `'exited'`, `'destroyed'`).
- `callback`: An asynchronous function to execute when the event occurs.

#### Example

```typescript
onTenantContext('created', async (tenant) => {
  console.log(`Tenant created: ${tenant.name}`);
});
```

### `getTenantName(): string`

Retrieves the name of the current tenant.

#### Throws

- `TenantContextNotFound` if no tenant context is active.

#### Example

```typescript
const tenantName = getTenantName();
console.log(tenantName);
```

### `getTenantId(): string`

Retrieves the ID of the current tenant.

#### Throws

- `TenantContextNotFound` if no tenant context is active.

#### Example

```typescript
const tenantId = getTenantId();
console.log(tenantId);
```

## Errors

### `TenantContextNotFound`

Thrown when attempting to access a tenant context that does not exist.

### `TenantContextMismatch`

Thrown when attempting to run a callback with a different tenant context while another is already active.

## Testing

Run the tests to ensure everything is working correctly:

```bash
pnpm test
```

## License

This package is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
