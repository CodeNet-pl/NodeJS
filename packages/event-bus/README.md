# CQRS module

This module has been rewritten from `@nestjs/cqrs` with added capabilities to:

* Decoupled EventBus from the framework, making it usable in non-NestJS applications;
* Execute event handlers synchronously at the time when an event is published;
* Support for both class-based and POJO events;
* Support for both class-based and function-based event handlers;
* Simplified API for registering handlers and publishing events.

Additionally removed command and query handling from original package to focus solely on event handling.

## Installation

```sh
pnpm add @codenet/event-bus
```

## Usage

### Class based xample

```ts
import { EventBus, IEventHandler } from '@codenet/event-bus';

class UserCreated {
 constructor(public readonly userId: string) {}
}

class UserCreatedHandler implements IEventHandler<UserCreated> {
  handle(event: UserCreated) {
    console.log(`User created: ${event.userId}`);
  }
}

const eventBus = new EventBus({
  // This is the default policy, but you can customize it
  eventTypePolicy: (evt) => evt.constructor.name,
});
eventBus.register([UserCreated], new UserCreatedHandler());
eventBus.publish(new UserCreated('123'));
```

### POJO example

```ts
import { EventBus, IEventHandler } from '@codenet/event-bus';

type UserCreated = {
  readonly type: 'UserCreated';
  readonly userId: string;
} | {
  readonly type: 'UserDeleted';
  readonly userId: string;
}

class UserCreatedHandler implements IEventHandler<UserCreated> {
  handle(event: UserCreated) {
    console.log(`User created: ${event.userId}`);
  }
}

const eventBus = new EventBus({
  eventTypePolicy: (evt) => evt.type,
});
eventBus.register(['UserCreated'], new UserCreatedHandler());
eventBus.publish({ type: 'UserCreated', userId: '123' });
```

### NestJS Integration

You can use this module instead of `@nestjs/cqrs` in your NestJS application.

```ts
import { EventBusModule } from '@codenet/event-bus/nestjs';

@Module({
  imports: [EventBusModule],
  providers: [UserCreatedHandler],
})
export class AppModule {}

class MyService {
  constructor(private readonly eventBus: EventBus) {}

  createUser(userId: string) {
    // ... create user logic
    this.eventBus.publish(new UserCreated(userId));
  }
}
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

MIT
