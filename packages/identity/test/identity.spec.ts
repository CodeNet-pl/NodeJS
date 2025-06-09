import { Uuid } from '../src';

it('should fail typechecking', () => {
  class UserId extends Uuid.for<'User'>() {}
  class ProductId extends Uuid.for<'Product'>() {}

  let userId = new UserId();
  const productId = new ProductId();

  // @ts-expect-error This should fail typechecking
  userId = productId;
  expect(userId).toBeDefined();
});
