import { resolveHref, withBaseUrl } from '../src/hook';

it('should generate href with /', () => {
  withBaseUrl('http://localhost:3000', async () => {
    expect(resolveHref('/test')).toBe('http://localhost:3000/test');
  });
});

it('should generate href without /', () => {
  withBaseUrl('http://localhost:3000', async () => {
    expect(resolveHref('test')).toBe('http://localhost:3000/test');
  });
});

it('should generate href with query parameters', () => {
  withBaseUrl('http://localhost:3000', async () => {
    expect(resolveHref('/test?param=value')).toBe(
      'http://localhost:3000/test?param=value'
    );
  });
});

it('should generate href with baseUrl containing trailing slash', () => {
  withBaseUrl('http://localhost:3000/', async () => {
    expect(resolveHref('/test')).toBe('http://localhost:3000/test');
  });
});

it('will resolve href without hostname if called without hook', () => {
  expect(resolveHref('/test')).toBe('/test');
});
