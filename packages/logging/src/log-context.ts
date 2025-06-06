export type LogContext = {
  error?: Error | unknown;
  [key: string]: any;
};
