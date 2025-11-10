import { NotFound } from '@code-net/errors';
import { AsyncLocalStorage } from 'node:async_hooks';

export class TenantContextNotFound extends NotFound {
  constructor() {
    super(`Tenant context not found`);
  }
}

export class TenantContextMismatch extends Error {
  constructor() {
    super(
      `Cannot run with a different tenant context. Complete the existing context first.`
    );
  }
}

export type TenantContext = { id: string; name: string };

const storage = new AsyncLocalStorage<TenantContext>();
type TenantContextEvent =
  | 'creating'
  | 'created'
  | 'entered'
  | 'exited'
  | 'destroying'
  | 'destroyed';

const listeners = new Map<
  TenantContextEvent,
  Array<(tenant: TenantContext) => Promise<void>>
>();

const queues = new Map<string, Promise<unknown>>();

export function withTenant<T>(
  tenant: TenantContext,
  callback: (tenant: TenantContext) => Promise<T>
): Promise<T> {
  const existing = storage.getStore();
  if (existing && existing.id === tenant.id) {
    return callback(tenant);
  }

  if (existing && existing.id !== tenant.id) {
    throw new TenantContextMismatch();
  }

  // Check if we need to start a new context or reuse existing
  const previousPromise = queues.get(tenant.id) ?? Promise.resolve();

  // Chain the new operation after the previous one completes (or fails)
  const promise = previousPromise
    .catch(() => {
      // Ignore errors from previous operations in the queue
      // Each operation handles its own errors
    })
    .then(() =>
      storage.run(tenant, async () => {
        await create(tenant);
        await emitEvent('entered', tenant);

        try {
          const result = await callback(tenant);
          return result;
        } finally {
          // Clean up the queue only if this is the last promise
          if (queues.get(tenant.id) === promise) {
            queues.delete(tenant.id);
          }
          // Fire exited event
          await emitEvent('exited', tenant);
        }
      })
    );

  queues.set(tenant.id, promise);
  return promise;
}

const creating = new Map<string, Promise<void>>();

/**
 * Creates the tenant context if not already being created or was already created.
 */
async function create(tenant: TenantContext) {
  if (creating.has(tenant.id)) {
    await creating.get(tenant.id);
    return;
  }
  const promise = emitEvent('creating', tenant);
  creating.set(tenant.id, promise);
  try {
    await promise;
    await emitEvent('created', tenant);
  } finally {
    creating.delete(tenant.id);
  }
}

async function emitEvent(event: TenantContextEvent, tenant: TenantContext) {
  for (const listener of listeners.get(event) ?? []) {
    await listener(tenant);
  }
}

export function onTenantContext(
  event: TenantContextEvent,
  callback: (tenant: TenantContext) => Promise<void>
) {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  listeners.get(event)?.push(callback);
}

export function getTenantName(): string {
  const tenant = storage.getStore();

  if (!tenant) {
    throw new TenantContextNotFound();
  }

  return tenant.name;
}

export function getTenantId(): string {
  const tenant = storage.getStore();

  if (!tenant) {
    throw new TenantContextNotFound();
  }
  return tenant.id;
}

export function hasTenant(): boolean {
  const tenant = storage.getStore();

  return !!tenant;
}

export function getTenant(): TenantContext {
  const tenant = storage.getStore();

  if (!tenant) {
    throw new TenantContextNotFound();
  }

  return tenant;
}
