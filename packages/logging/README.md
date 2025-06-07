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
  abstract log(level: LogLevel, message: string | Error, context?: LogContext): void;

  /**
   * Creates a child logger that will always add given context to all logs
   */
  abstract child(context: LogContext): Logger;
}
```

## Implementations

### Mock Logger

This package contains a mock implementation of the interface, which is useful for testing purposes.

```ts
import { MockLogger, Logger } from '@code-net/logging';

const logger: Logger = new MockLogger();
logger.emergency('Hello world!') // Does nothing
```

### Pino

If you need pino then it is supported via package [@code-net/logging-pino](https://www.npmjs.com/package/@code-net/logging-pino).

## License

This project is licensed under the terms of the MIT license.
