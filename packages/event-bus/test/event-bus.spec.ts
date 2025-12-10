import { EventBus } from '../src';

it('can publish objects handled by POJO object', async () => {
  const eventBus = new EventBus({
    eventTypePolicy: (evt) => evt.type,
  });

  eventBus.register(['UserCreated'], {
    handle: async (event: any) => {
      expect(event).toEqual({ type: 'UserCreated', userId: '123' });
    },
  });

  await eventBus.publish({ type: 'UserCreated', userId: '123' });
  expect.assertions(1);
});

it('can publich objects handled by function handler', async () => {
  const eventBus = new EventBus({
    eventTypePolicy: (evt) => evt.type,
  });

  eventBus.register(['OrderPlaced'], async (event: any) => {
    expect(event).toEqual({ type: 'OrderPlaced', orderId: 'abc' });
  });

  await eventBus.publish({ type: 'OrderPlaced', orderId: 'abc' });
  expect.assertions(1);
});

it('can publish classes handled by class handler', async () => {
  class ProductAdded {
    constructor(public productId: string) {}
  }

  class ProductAddedHandler {
    async handle(event: ProductAdded) {
      expect(event).toBeInstanceOf(ProductAdded);
      expect(event.productId).toBe('p1');
    }
  }

  const eventBus = new EventBus();

  eventBus.register([ProductAdded], new ProductAddedHandler());

  await eventBus.publish(new ProductAdded('p1'));
  expect.assertions(2);
});
