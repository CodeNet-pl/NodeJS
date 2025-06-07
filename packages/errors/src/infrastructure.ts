import { ApplicationError, Conflict, InternalError, NotFound } from './application';

export abstract class InfrastructureError extends Error {}
export class PersistenceError extends InfrastructureError {}
export class ConcurrencyError extends PersistenceError {}
export class RecordNotFound extends PersistenceError {}

export function mapInfrastructureToApplicationError(error: InfrastructureError): ApplicationError {
  if (error instanceof ConcurrencyError) {
    return new Conflict(error.message, { cause: error });
  }
  if (error instanceof RecordNotFound) {
    return new NotFound(error.message);
  }
  return new InternalError('Internal error', { cause: error });
}
