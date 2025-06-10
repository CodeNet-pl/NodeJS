import { DatabaseContext, TransactionOptions } from './database-context';

/**
 * Transactional decorator for methods that require a database transaction.
 * It will automatically find the first DatabaseContext in the class and
 * execute the method within a transaction.
 */
export const Transactional =
  (options?: TransactionOptions): MethodDecorator =>
  (target: object, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    if (!originalMethod || typeof originalMethod !== 'function') {
      return descriptor;
    }

    descriptor.value = function (this: Record<string, any>, ...args: any[]) {
      const dbContextKey = Object.keys(this).find(
        (key) => typeof this[key] === 'object' && 'transaction' in this[key]
      );
      if (!dbContextKey) {
        throw new Error(
          `No DatabaseContext found on class ${target.constructor.name}`
        );
      }
      const dbContext = this[dbContextKey] as DatabaseContext;
      return dbContext.transaction(
        () => originalMethod.apply(this, args),
        options
      );
    } as typeof originalMethod;

    return descriptor;
  };
