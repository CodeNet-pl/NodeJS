import { setTimeout } from 'timers/promises';
import { withTenant } from './multi-tenancy';
import { createTenantContextManager } from './tenant-context-pool';

let active = 0;
const { run: withTenantPool, destroy } = createTenantContextManager({
  create: async (tenant) => {
    await setTimeout(10);
    active++;
    return { tenant, createdAt: Date.now() };
  },
  destroy: async (context) => {
    // simulate async cleanup
    active--;
    await setTimeout(10);
  },
});

afterAll(async () => {
  await destroy();
});

it('creates and reuses context for the same tenant', async () => {
  await withTenant({ id: '1', name: 'test' }, async () => {
    await withTenantPool(() => {
      expect(active).toBe(1);
    });
    await withTenantPool(() => {
      expect(active).toBe(1);
    });
  });
  expect(active).toBe(1);
});
