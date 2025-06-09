import { Uuid } from '../src';

it('should fail typechecking', () => {
  class UserId extends Uuid<'User'> {}
  class ProductId extends Uuid<'Product'> {}

  let userId = new UserId();
  const productId = new ProductId();

  // @ts-expect-error This should fail typechecking
  userId = productId;
  expect(userId).toBeDefined();
});

it('will throw InvalidValue for invalid UUID', () => {
  class MyId extends Uuid<'My'> {}

  expect(() => {
    new MyId('invalid-uuid');
  }).toThrow(`MyId is not valid UUID, given: "invalid-uuid"`);
});
