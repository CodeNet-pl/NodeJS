import { LogContext, Logger, LogLevel } from '@code-net/logging';
import pino, { Logger as Pino } from 'pino';

export const pinoCustomLevels: Record<LogLevel, number> = {
  debug: 10,
  notice: 20,
  info: 30,
  warning: 40,
  alert: 45,
  error: 50,
  critical: 60,
  emergency: 70,
} as const;

export const createPino = (options?: { level?: string; pretty?: boolean }) => {
  return pino<LogLevel>({
    level: options?.level,
    customLevels: pinoCustomLevels,
    useOnlyCustomLevels: true,
    transport: options?.pretty
      ? {
          targets: [
            {
              target: 'pino-pretty',
              level: 'debug',
              options: {
                colorize: true,
                ignore: 'hostname,pid',
                translateTime: 'yyyy-mm-dd HH:MM:ss',
                singleLine: true,
              },
            },
          ],
        }
      : undefined,
  });
};

export class PinoLogger implements Logger {
  constructor(private readonly logger: Pino) {}

  public debug(message: string, context?: LogContext): void {
    return this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    return this.log('info', message, context);
  }

  public warning(message: string, context?: LogContext): void {
    return this.log('warning', message, context);
  }

  public notice(message: string, context?: LogContext): void {
    return this.log('notice', message, context);
  }

  public error(message: string, context?: LogContext): void {
    return this.log('error', message, context);
  }

  public critical(message: string, context?: LogContext): void {
    return this.log('critical', message, context);
  }

  public alert(message: string, context?: LogContext): void {
    return this.log('alert', message, context);
  }

  public emergency(message: string, context?: LogContext): void {
    return this.log('emergency', message, context);
  }

  public log(level: LogLevel, message: string, context?: LogContext): void {
    let error: unknown = context?.error;
    if (error) {
      error = error instanceof Error ? error.message : String(error);
    }

    // @ts-expect-error pino has no type for custom levels
    this.logger[level]({ msg: message, ...context, error });
  }

  public child(context: LogContext): Logger {
    return new PinoLogger(this.logger.child(context));
  }
}
