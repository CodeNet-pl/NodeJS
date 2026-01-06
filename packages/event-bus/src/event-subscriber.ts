import { EventHandler } from './event-handler.interface';
import { IEvent } from './event.interface';

export type EventName<EventBase extends IEvent> = EventBase extends {
  type: infer TypeName;
}
  ? TypeName extends string
    ? TypeName
    : never
  : never;

export type EventSubscribers<EventBase extends IEvent> = {
  [Name in EventName<EventBase>]?: EventHandler<
    Extract<EventBase, { type: Name }>
  >;
};

export type EventSubscriber<EventBase extends IEvent = IEvent> = {
  subscribe: (subscribers: EventSubscribers<EventBase>) => void;
};
