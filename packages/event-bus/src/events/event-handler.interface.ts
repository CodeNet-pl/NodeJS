import { IEvent } from './event.interface';

export type EventHandlerFunc<T extends IEvent = any> = (
  event: T
) => Promise<void> | void;

export type EventHandlerObject<T extends IEvent = any> = {
  handle(event: T): Promise<void> | void;
};

export type EventHandler<T extends IEvent = any> =
  | EventHandlerObject<T>
  | EventHandlerFunc<T>;

// NestJS compatible interface
export interface IEventHandler<EventBase extends IEvent = IEvent> {
  handle(event: EventBase): Promise<void> | void;
}
