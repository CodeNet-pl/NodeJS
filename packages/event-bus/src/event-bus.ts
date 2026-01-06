import { Injectable, Type } from '@nestjs/common';
import { IEventBus } from './event-bus.interface';
import {
  EventHandler,
  EventHandlerFunc,
  IEventHandler,
} from './event-handler.interface';
import { EventSubscriber, EventSubscribers } from './event-subscriber';
import { IEvent } from './event.interface';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  implements IEventBus<EventBase>, EventSubscriber<EventBase>
{
  private readonly handlers: Record<string, EventHandlerFunc<EventBase>[]> = {};
  constructor(
    private options: { eventTypePolicy: (evt: EventBase) => string } = {
      eventTypePolicy: (evt: EventBase) =>
        (evt as { type?: string }).type ?? evt.constructor.name,
    }
  ) {}

  public async publish<T extends EventBase>(event: T) {
    const handlers = this.handlers[this.getEventName(event)] || [];
    // Assign the variable purely for typings purposes
    for (const handler of handlers) {
      await handler(event);
    }
  }

  public async publishAll<T extends EventBase>(events: T[]) {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public subscribe(subscribers: EventSubscribers<EventBase>): void {
    for (const eventName of Object.keys(subscribers) as Array<
      keyof EventSubscribers<EventBase>
    >) {
      const handler = subscribers[eventName];
      if (handler) {
        this.register(eventName as string, handler as EventHandler<EventBase>);
      }
    }
  }

  public register<T extends EventBase = EventBase>(
    events: string | Type<T> | Array<string | Type<T>>,
    instance: EventHandler<T>
  ): void {
    const handler = this.extractHandlerFunc(instance);
    const eventList = Array.isArray(events) ? events : [events];

    for (const event of eventList) {
      const eventName = this.getEventName(event);
      this.handlers[eventName] = [
        ...(this.handlers[eventName] || []),
        handler as EventHandlerFunc<EventBase>,
      ];
    }
  }

  private extractHandlerFunc<T extends EventBase>(
    instance: EventHandler<T>
  ): EventHandlerFunc<T> {
    return typeof instance === 'function'
      ? instance
      : instance.handle.bind(instance);
  }

  private getEventName(event: string | Type<EventBase> | EventBase) {
    const name =
      typeof event === 'string'
        ? event
        : typeof event === 'function'
        ? event.name
        : this.options.eventTypePolicy
        ? this.options.eventTypePolicy(event)
        : event.constructor.name;

    if (!name) {
      throw new Error(
        `EventBus: Unable to determine event name for event: ${JSON.stringify(
          event
        )}`
      );
    }

    return name;
  }
}
