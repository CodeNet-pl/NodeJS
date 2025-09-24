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
