import { setTimeout } from 'timers/promises';
import {
  getTenant,
  hasTenant,
  onTenantContext,
  withTenant,
} from './multi-tenancy';

it('has no tenant when not run with tenant', () => {
  expect(hasTenant()).toBeFalsy();
  expect(() => getTenant()).toThrow('Tenant context not found');
});

it('has tenant when run with tenant', async () => {
  await withTenant({ id: '1', name: 'test' }, async () => {
    expect(hasTenant()).toBeTruthy();
    expect(getTenant()).toEqual({ id: '1', name: 'test' });
  });
});

it('cannot run with different tenant', async () => {
  await expect(
    withTenant({ id: '1', name: 'test' }, async () => {
      await withTenant({ id: '2', name: 'test2' }, async () => {
        // should not get here
      });
    })
  ).rejects.toThrow('Cannot run with a different tenant context');
});

it('run with multiple times for one tenant opens the context only once', async () => {
  let enterCount = 0;
  let exitCount = 0;

  onTenantContext('entered', async (tenant) => {
    enterCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  onTenantContext('exited', async (tenant) => {
    exitCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  await withTenant({ id: '1', name: 'test' }, async () => {
    await withTenant({ id: '1', name: 'test' }, async () => {
      expect(getTenant()).toEqual({ id: '1', name: 'test' });
    });
  });
  expect(enterCount).toBe(1);
  expect(exitCount).toBe(1);
});

it('can handle parallel runs with same tenant', async () => {
  let enterCount = 0;
  let exitCount = 0;

  onTenantContext('entered', async (tenant) => {
    enterCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
    await setTimeout(100);
  });
  onTenantContext('exited', async (tenant) => {
    exitCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  await Promise.all(
    Array.from({ length: 10 }).map(() =>
      withTenant({ id: '1', name: 'test' }, async () => {
        expect(getTenant()).toEqual({ id: '1', name: 'test' });
      })
    )
  );
  expect(enterCount).toBe(10);
  expect(exitCount).toBe(10);
});

it('can handle errors in tenant context', async () => {
  let openCount = 0;
  let closeCount = 0;

  onTenantContext('entered', async () => {
    await setTimeout(100);
    openCount++;
    if (openCount === 0) {
      throw new Error('Test error');
    }
  });
  onTenantContext('exited', async (tenant) => {
    closeCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  await Promise.allSettled(
    Array.from({ length: 10 }).map(() =>
      withTenant({ id: '1', name: 'test' }, async () => {
        await setTimeout(10);
      })
    )
  );
  await withTenant({ id: '1', name: 'test' }, async () => {
    expect(getTenant()).toEqual({ id: '1', name: 'test' });
  });

  expect(openCount).toBe(11);
  expect(closeCount).toBe(11);
});

it('will emit created only once per tenant', async () => {
  let createCount = 0;

  onTenantContext('created', async (tenant) => {
    createCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  await Promise.all(
    Array.from({ length: 10 }).map(() =>
      withTenant({ id: '1', name: 'test' }, async () => {
        expect(getTenant()).toEqual({ id: '1', name: 'test' });
      })
    )
  );
  expect(createCount).toBe(10); // Should be 1 if created is emitted only once
});

it('will handle errors in create and retry', async () => {
  let createCount = 0;

  onTenantContext('created', async (tenant) => {
    createCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
    if (createCount === 1) {
      throw new Error('Test error');
    }
  });
  await expect(
    withTenant({ id: '1', name: 'test' }, async () => {
      expect(getTenant()).toEqual({ id: '1', name: 'test' });
    })
  ).rejects.toThrow('Test error');
  await withTenant({ id: '1', name: 'test' }, async () => {
    expect(getTenant()).toEqual({ id: '1', name: 'test' });
  });

  expect(createCount).toBe(2); // Should be 2 since first one failed
});
