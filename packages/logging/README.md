# Logger

This package provides a logging abstract class for applications. It defines a set of log levels and methods for logging messages at each level. The interface is designed to be implemented by different logging libraries, allowing for flexibility in the choice of logging backend.

It is based on PHP's [PSR-3](https://www.php-fig.org/psr/psr-3/) logging interface, which is a widely accepted standard for logging in PHP applications.

```ts
export abstract class Logger {
  /**
   * Detailed debug information.
   */
  abstract debug(message: string, context?: LogContext): void;

  /**
   * Interesting events.
   *
   * Example: User logs in, SQL logs.
   */
  abstract info(message: string, context?: LogContext): void;

  /**
   * Normal but significant events.
   */
  abstract notice(message: string, context?: LogContext): void;

  /**
   * Exceptional occurrences that are not errors.
   *
   * Example: Use of deprecated APIs, poor use of an API, undesirable things
   * that are not necessarily wrong.
   */
  abstract warning(message: string, context?: LogContext): void;

  /**
   * Runtime errors that do not require immediate action but should typically
   * be logged and monitored.
   */
  abstract error(message: string, context?: LogContext): void;

  /**
   * Critical conditions.
   *
   * Example: Application component unavailable, unexpected exception.
   */
  abstract critical(message: string, context?: LogContext): void;

  /**
   * Action must be taken immediately.
   *
   * Example: Entire website down, database unavailable, etc. This should
   * trigger the SMS alerts and wake you up.
   */
  abstract alert(message: string, context?: LogContext): void;

  /**
   * System is unusable.
   */
  abstract emergency(message: string, context?: LogContext): void;

  /**
   * Log a message with level given as an argument
   */
  abstract log(level: LogLevel, message: string, context?: LogContext): void;

  /**
   * Creates a child logger that will always add given context to all logs
   */
  abstract child(context: LogContext): Logger;
}
```

## Implementations

### Noop Logger

This package contains a mock implementation of the interface, which is useful for testing purposes.

```ts
import { NoopLogger, Logger } from '@code-net/logging';

const logger: Logger = new NoopLogger();
logger.emergency('Hello world!') // Does nothing
```

### Pino

To use pino with this package wrap it with `PinoLogger`:

```ts
import pino from 'pino';
import { PinoLogger, Logger } from '@code-net/logging';

const logger = new PinoLogger(pino());

logger.info('Hello world!', { userId: 123 });
```

### Global logger

For convenience, a global logger instance is provided that can be set and used throughout the application.

Setup global logger before your application starts:

```ts
import pino from 'pino';
import { setGlobalLogger } from '@code-net/logging';
import { PinoLogger } from '@code-net/logging';

setGlobalLogger(new PinoLogger(pino()));
```

Usage:

```ts
import { logger } from '@code-net/logging';
logger.info('Hello world!', { userId: 123 });
```

By default, the global logger is a `NoopLogger`.

## License

This project is licensed under the terms of the MIT license.
