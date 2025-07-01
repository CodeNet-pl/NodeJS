import { Knex } from 'knex';
import { AsyncLocalStorage } from 'node:async_hooks';

type KnexStore = { trx: Knex.Transaction };

export class KnexStorage {
  private storage = new AsyncLocalStorage();

  /**
   * Runs the async code with the auth store provided
   */
  run(store: KnexStore, cb: () => void): void {
    return this.storage.run(store, cb);
  }

  /**
   * Attach the auth store for the remaining of code execution
   */
  attach(store: KnexStore): void {
    this.storage.enterWith(store);
  }

  /**
   * Retrieve the auth store
   */
  get(): KnexStore | undefined {
    const store = this.storage.getStore();
    if (!this.isKnexStore(store)) {
      // throw new Error('Knex store not initialized');
      return undefined;
    }
    return store;
  }

  private isKnexStore(store: unknown): store is KnexStore {
    return (
      store !== undefined &&
      store !== null &&
      typeof store === 'object' &&
      'trx' in store
    );
  }
}
