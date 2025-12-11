import { LogContext } from './log-context';
import { LogLevel } from './log-level';
import { Logger } from './logger';

/**
 * A mock logger that can be used in tests in place of a real logger
 */
export class NoopLogger implements Logger {
  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public warning(message: string, context?: LogContext): void {
    this.log('warning', message, context);
  }

  public notice(message: string, context?: LogContext): void {
    this.log('notice', message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  public critical(message: string, context?: LogContext): void {
    this.log('critical', message, context);
  }

  public alert(message: string, context?: LogContext): void {
    this.log('alert', message, context);
  }

  public emergency(message: string, context?: LogContext): void {
    this.log('emergency', message, context);
  }

  public log(level: LogLevel, message: string, context?: LogContext): void {}

  public child(context: LogContext): Logger {
    return this;
  }
}

export const MockLogger = NoopLogger;
export type MockLogger = NoopLogger;
