# Pino Logger

This package provides pino backend for `@code-net/logging` package.

## Usage

This package contains `pino` implementation of the `Logger` class defined in `@code-net/logging` package. To make use of it, you need to install `@code-net/logging`, `@code-net/logging-pino` and `pino` packages:

```bash
npm install @code-net/logging @code-net/logging-pino pino
```

```ts
import pino from 'pino';
import { LogLevel, Logger } from '@code-net/logging';
import { PinoLogger, pinoCustomLevels } from '@code-net/logging-pino';

const logger: Logger = new PinoLogger(
  pino<LogLevel>({
    level: 'info',
    customLevels: pinoCustomLevels,
    useOnlyCustomLevels: true,
  })
)

logger.debug('Hello world!') // logs with level debug
logger.info('Hello world!') // logs with level info
logger.notice('Hello world!') // logs with level notice
logger.warning('Hello world!') // logs with level warning
logger.error('Hello world!') // logs with level error
logger.critical('Hello world!') // logs with level critical
logger.alert('Hello world!') // logs with level alert
logger.emergency('Hello world!') // logs with level emergency
```

## License

This project is licensed under the terms of the MIT license.
