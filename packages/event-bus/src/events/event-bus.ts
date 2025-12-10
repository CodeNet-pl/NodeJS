import { Injectable, Type } from '@nestjs/common';
import { EVENTS_HANDLER_METADATA } from '../constants';
import { IEventBus } from './event-bus.interface';
import { IEventHandler } from './event-handler.interface';
import { IEvent } from './event.interface';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  implements IEventBus<EventBase>
{
  private readonly handlers: { [eventName: string]: IEventHandler<IEvent>[] } =
    {};

  public async publish<T extends EventBase>(event: T) {
    const handlers = this.handlers[this.getEventName(event)] || [];

    // Assign the variable purely for typings purposes
    for (const handler of handlers) {
      await handler.handle(event);
    }
  }

  public async publishAll<T extends EventBase>(events: T[]) {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public register(instance: IEventHandler<EventBase>) {
    const events = this.reflectEventsNames(instance.constructor as any);
    for (const event of events) {
      this.handlers[event.name] = [
        ...(this.handlers[event.name] || []),
        instance,
      ];
    }
  }

  private reflectEventsNames(
    handler: EventHandlerType<EventBase>
  ): Type<EventBase>[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private getEventName(event: EventBase) {
    return event.constructor.name;
  }
}
