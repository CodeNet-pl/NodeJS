import { Logger } from './logger';
import { NoopLogger } from './mock';

export let logger: Logger = new NoopLogger();

export const setGlobalLogger = (newLogger: NoopLogger) => {
  logger = newLogger;
};
