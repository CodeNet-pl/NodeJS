export type IsolationLevel =
  | 'read uncommitted'
  | 'read committed'
  | 'repeatable read'
  | 'serializable';

export type TransactionOptions = {
  /**
   * If this should escape parent transaction and start a new one.
   */
  independent?: boolean;

  /**
   * Isolation level for the transaction.
   */
  isolationLevel?: IsolationLevel;
};

export interface DatabaseContext<TContext = unknown> {
  /**
   * Executes a callback within a transaction.
   * If no transaction is active, it will start a new one.
   * If a transaction is already active, it will use that one.
   *
   * Specify `independent: true` in options to start a new transaction.
   * Specify `isolationLevel` to set the isolation level for the transaction.
   */
  transaction<TReturn>(
    cb: (context?: TContext) => Promise<TReturn>,
    options?: TransactionOptions
  ): Promise<TReturn>;

  /**
   * Executes a callback without a transaction.
   * Useful for:
   * - read-only operations like getting data from read replicas
   * - multi-tenancy where you want to read from a specific tenant's database
   */
  read<TReturn>(cb: (context?: TContext) => Promise<TReturn>): Promise<TReturn>;
}
