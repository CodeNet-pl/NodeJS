import {
  ApplicationError,
  Conflict,
  InternalError,
  NotFound,
  ValidationError,
} from './application';

export abstract class DomainError extends Error {}

export class BusinessRuleViolation extends DomainError {}
export const InvalidState = BusinessRuleViolation;

/**
 * The value is not valid for the domain.
 * Use eg. with value objects.
 */
export class InvalidValue extends DomainError {}

/**
 * The domain entity was not found.
 */
export class EntityNotFound extends DomainError {}

export function mapDomainToApplicationError(error: DomainError): ApplicationError {
  if (error instanceof BusinessRuleViolation) {
    return new Conflict(error.message, { cause: error });
  }
  if (error instanceof InvalidValue) {
    return new ValidationError(error.message);
  }
  if (error instanceof EntityNotFound) {
    return new NotFound(error.message, { cause: error });
  }
  return new InternalError('Internal error', { cause: error });
}
