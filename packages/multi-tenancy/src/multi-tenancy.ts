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
type TenantContextEvent = 'created' | 'entered' | 'exited' | 'destroyed';

const listeners = new Map<
  TenantContextEvent,
  Array<(tenant: TenantContext) => Promise<void>>
>();

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

  return storage.run(tenant, async () => {
    emitEvent('created', tenant);
    try {
      const result = await callback(tenant);
      return result;
    } finally {
      emitEvent('destroyed', tenant);
    }
  });
}

function emitEvent(event: TenantContextEvent, tenant: TenantContext) {
  for (const listener of listeners.get(event) ?? []) {
    listener(tenant);
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
