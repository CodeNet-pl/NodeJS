import { Transactional } from '../src';

it('should call transaction method', async () => {
  const mockDbContext = {
    transaction: jest.fn((fn: () => Promise<void>) => fn()),
  };
  class TestClass {
    dbContext = mockDbContext;

    @Transactional()
    async testMethod() {
      // Simulate some work
      return 'done';
    }
  }

  const instance = new TestClass();
  const result = await instance.testMethod();
  expect(result).toBe('done');
  expect(mockDbContext.transaction).toHaveBeenCalled();
});
