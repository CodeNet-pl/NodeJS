# Errors

This package contains application, domain and infrastructure layer errors. The idea is to provide a stable way to handle errors in a more structured way, allowing for better separation of concerns easier testing and translation between layers.

No more generic 500 errors in your application, no more `Error` objects with no information about what went wrong.

## Application Errors

Application errors are used to indicate errors that occur during the execution of the application. They are typically used to indicate errors that are not related to the domain logic, such as network errors, database errors, etc.

Examples:

- `NotFound` - Indicates that the requested resource was not found;
- `AccessDenied` / `PermissionDenied` - Indicates that the user does not have permission to access the requested resource;
- `InvalidValue` - Indicates that the provided value is invalid;
- `InvalidState` - Indicates that the application is in an invalid state;
- `InternalError` - Indicates that an internal error occurred;
- `NotImplemented` - Indicates that the requested feature is not implemented;
- `OperationTimeout` - Indicates that the operation timed out;
- `ServiceUnavailable` - Indicates that the service is unavailable;
- `ValidationError` - Indicates that the provided value is invalid;

## Domain Errors

Domain errors are used to indicate errors that occur during the execution of the domain logic. They are typically used to indicate errors that are related to the domain logic, such as validation errors, business rule violations, etc.

Examples:

- `BusinessRuleViolation` / `InvalidState` - Indicates that a business rule was violated;
- `InvalidValue` - Indicates that the provided value is invalid;
- `EntityNotFound` - Indicates that the requested domain entity was not found;

## Infrastructure Errors

Infrastructure errors are used to indicate errors that occur during the execution of the infrastructure, such as network errors, database errors, etc.

Examples:

- `PersistenceError` - Indicates that a persistence error occurred;
- `ConcurrencyError` - Indicates that a concurrency error occurred;

## Why?

Usually all errors in nodejs ecosystem are scoped to HTTP layer, this makes it hard to write HTTP agnostic code. This package is designed to provide a way to handle errors in a more structured way, allowing for better separation of concerns and easier testing.

## Usage

```ts
import { NotFound } from '@code-net/errors';

throw new NotFound('User not found');
```

Re-throwing errors:

```ts
import { NotFound } from '@code-net/errors';

try {
  // logic
} catch (e) {
  throw new NotFound('User not found', { cause: e });
}
```

### Mapping between layers

Mapping domain layer to application layer:

```ts
import { mapDomainToApplicationError, EntityNotFound } from '@code-net/errors';

mapDomainToApplicationError(new EntityNotFound('User not found')); // NotFound with cause User not found
mapDomainToApplicationError(new BusinessRuleViolation('Limit exceeded')); // Conflict with cause Limit exceeded
```

Mapping infrastructure layer to application layer:

```ts
import { mapInfrastructureToApplicationError, PersistenceError } from '@code-net/errors';
import { NotFound } from '@code-net/errors';
import { InternalError } from '@code-net/errors';

mapInfrastructureToApplicationError(new ConcurrencyError('Optimistic lock failed')); // Conflict with cause Optimistic lock failed
```

### Translating into HTTP errors

You have to register the error mapper in your application. This is usually done in the main file of your application.

```ts
import { mapErrorToApplicationError } from '@code-net/errors';

const applicationError = mapErrorToApplicationError(error); // ApplicationError

if (error instanceof NotFound) {
  res.setStatus(404).json({
    message: error.message,
  });
}
// ...
```

## License

This project is licensed under the MIT License.
