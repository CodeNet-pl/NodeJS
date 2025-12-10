import { IEvent } from './event.interface';

export interface IEventBus<EventBase extends IEvent = IEvent> {
  publish<T extends EventBase>(event: T): Promise<void>;
  publishAll(events: EventBase[]): Promise<void>;
}
