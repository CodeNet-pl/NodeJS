import { Type } from '@nestjs/common';
import { IEventHandler } from './events';

export interface CqrsOptions {
  events: Type<IEventHandler>[];
}
