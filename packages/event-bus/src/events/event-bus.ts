import { Injectable, Type } from '@nestjs/common';
import { IEventBus } from './event-bus.interface';
import {
  EventHandler,
  EventHandlerFunc,
  IEventHandler,
} from './event-handler.interface';
import { IEvent } from './event.interface';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  implements IEventBus<EventBase>
{
  private readonly handlers: {
    [eventName: string]: EventHandlerFunc<EventBase>[];
  } = {};
  constructor(
    private options: { eventTypePolicy: (evt: any) => string } = {
      eventTypePolicy: (evt: any) => evt.constructor.name,
    }
  ) {}

  public async publish<T extends EventBase>(event: T) {
    const handlers = this.handlers[this.getEventName(event)] || [];
    console.log(this.handlers);
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

  public register(
    events: EventBase[],
    instance: EventHandler<EventBase>
  ): void {
    const handler =
      typeof instance === 'function'
        ? instance
        : instance.handle.bind(instance);

    for (const event of events) {
      const eventName = this.getEventName(event);
      console.log(event, eventName);
      this.handlers[eventName] = [...(this.handlers[eventName] || []), handler];
    }
  }

  private getEventName(event: any) {
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
