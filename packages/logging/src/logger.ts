import { LogContext } from './log-context';
import { LogLevel } from './log-level';

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
