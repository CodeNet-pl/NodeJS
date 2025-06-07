import { ApplicationError, InternalError } from './application';
import { DomainError, mapDomainToApplicationError } from './domain';
import { InfrastructureError, mapInfrastructureToApplicationError } from './infrastructure';

export function mapErrorToApplicationError(error: Error): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }
  if (error instanceof DomainError) {
    return mapDomainToApplicationError(error);
  }
  if (error instanceof InfrastructureError) {
    return mapInfrastructureToApplicationError(error);
  }
  return new InternalError('Internal error', { cause: error });
}
