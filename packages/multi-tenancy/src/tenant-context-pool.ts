import { Pool } from 'tarn';
import { getTenant, onTenantContext, TenantContext } from './multi-tenancy';

export function createTenantContextManager<TContext>(options: {
  create: (tenant: TenantContext) => Promise<TContext>;
  destroy: (context: TContext) => Promise<void>;
  idleTimeoutMillis?: number;
}) {
  const pools: Map<string, Pool<TContext>> = new Map();

  onTenantContext('created', async (tenant) => {
    let pool = pools.get(tenant.id);
    if (!pool) {
      pool = new Pool({
        create: () => options.create(tenant),
        destroy: (context) => options.destroy(context),
        max: 1,
        min: 0,
        idleTimeoutMillis: options.idleTimeoutMillis ?? 60000,
      });
      pools.set(tenant.id, pool);
    }
  });

  return {
    destroy: async () => {
      await Promise.allSettled(
        Array.from(pools.values()).map((pool) => pool.destroy())
      );
      pools.clear();
    },
    run: async <T>(cb: (context: TContext) => T) => {
      const tenant = getTenant();
      const pool = pools.get(tenant.id);
      if (!pool) {
        throw new Error(`No pool found for tenant ${tenant.id}`);
      }

      const op = pool.acquire();
      const context = await op.promise;
      try {
        await cb(context);
      } finally {
        pool.release(context);
      }
    },
  };
}
