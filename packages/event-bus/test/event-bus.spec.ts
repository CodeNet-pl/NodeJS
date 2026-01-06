import { EventBus } from '../src';

it('can publish objects handled by POJO object', async () => {
  type UserCreated = {
    type: 'UserCreated';
    userId: string;
  };
  type UserUpdated = {
    type: 'UserUpdated';
    userId: string;
    username: string;
  };
  const eventBus = new EventBus<UserCreated | UserUpdated>({
    eventTypePolicy: (evt) => evt.type,
  });

  eventBus.subscribe({
    UserCreated: async (event) => {
      expect(event).toEqual({ type: 'UserCreated', userId: '123' });
    },
  });

  await eventBus.publish({ type: 'UserCreated', userId: '123' });
  await eventBus.publish({
    type: 'UserUpdated',
    userId: '123',
    username: 'newname',
  });
  expect.assertions(1); // updated event is not handled
});

it('can publish objects handled by function handler', async () => {
  type OrderPlaced = {
    type: 'OrderPlaced';
    orderId: string;
  };
  const eventBus = new EventBus<OrderPlaced>({
    eventTypePolicy: (evt) => evt.type,
  });

  eventBus.register('OrderPlaced', async (event) => {
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

  const eventBus = new EventBus<ProductAdded>();

  eventBus.register(ProductAdded, new ProductAddedHandler());

  await eventBus.publish(new ProductAdded('p1'));
  expect.assertions(2);
});
