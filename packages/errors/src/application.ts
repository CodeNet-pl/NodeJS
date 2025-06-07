export abstract class ApplicationError extends Error {}

export class AccessDenied extends ApplicationError {}
export const PermissionDenied = AccessDenied;
export class InternalError extends ApplicationError {}
export class NotFound extends ApplicationError {}
export class NotImplemented extends ApplicationError {}
export class OperationTimeout extends ApplicationError {}
export class ValidationError extends ApplicationError {}
export class InvalidInput extends ValidationError {}
export class ServiceUnavailable extends ApplicationError {}
export class Conflict extends ApplicationError {}
export class OperationFailed extends ApplicationError {}
