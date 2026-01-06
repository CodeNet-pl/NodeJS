import { Type } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface';

export interface CqrsOptions {
  events: Type<IEventHandler>[];
}
