import { LogLevel } from '../../log-level.enum';
import { Logger } from '../../logger';
import { createPino, PinoLogger } from './pino-logger';

describe('PinoLogger', () => {
  let logger: Logger;
  let pino;

  beforeEach(() => {
    pino = createPino();
    logger = new PinoLogger(pino);
  });

  test('it should log info level without context', () => {
    const spy = jest.spyOn(pino, LogLevel.Info).mockImplementation();

    logger.info('hello world');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toMatchObject([{ msg: 'hello world' }]);
  });

  test('it should log info level with context', () => {
    const spy = jest.spyOn(pino, LogLevel.Info).mockImplementation();

    logger.info('hello world', { foo: 'bar' });

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toMatchObject([{ msg: 'hello world', foo: 'bar' }]);
  });

  test('it should log an error as string', () => {
    const spy = jest.spyOn(pino, LogLevel.Error).mockImplementation();

    logger.error('error');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toMatchObject([{ msg: 'error' }]);
  });

  test('it should log an error as type without context', () => {
    const spy = jest.spyOn(pino, LogLevel.Error).mockImplementation();

    logger.error(new Error('hello world'));

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toMatchObject([
      {
        msg: 'hello world',
        err: 'Error',
        stack: expect.stringMatching('Error: hello world'),
      },
    ]);
  });

  test('it should log an error as type with context', () => {
    const spy = jest.spyOn(pino, LogLevel.Error).mockImplementation();

    logger.error(new Error('hello world'), { foo: 'bar' });

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toMatchObject([
      {
        msg: 'hello world',
        err: 'Error',
        stack: expect.stringMatching('Error: hello world'),
        foo: 'bar',
      },
    ]);
  });

  test.each([
    LogLevel.Alert,
    LogLevel.Critical,
    LogLevel.Debug,
    LogLevel.Emergency,
    LogLevel.Error,
    LogLevel.Info,
    LogLevel.Notice,
    LogLevel.Warning,
  ])('it should log for level %s', (log: LogLevel) => {
    const spy = jest.spyOn(pino, log).mockImplementation();

    logger[log]('a message');

    expect(spy.mock.calls).toHaveLength(1);
  });
});
