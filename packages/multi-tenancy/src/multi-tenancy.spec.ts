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
  let openCount = 0;
  let closeCount = 0;

  onTenantContext('created', async (tenant) => {
    openCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  onTenantContext('destroyed', async (tenant) => {
    closeCount++;
    expect(tenant).toEqual({ id: '1', name: 'test' });
  });
  await withTenant({ id: '1', name: 'test' }, async () => {
    await withTenant({ id: '1', name: 'test' }, async () => {
      expect(getTenant()).toEqual({ id: '1', name: 'test' });
    });
  });
  expect(openCount).toBe(1);
  expect(closeCount).toBe(1);
});
