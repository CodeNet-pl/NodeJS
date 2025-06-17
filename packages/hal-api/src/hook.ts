import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<URL>();

export function withBaseUrl<T>(baseUrl: string, cb: () => T): T {
  return storage.run(
    new URL(baseUrl.at(-1) === '/' ? baseUrl : `${baseUrl}/`),
    cb
  );
}

export function getBaseUrl(): URL | undefined {
  return storage.getStore();
}

/**
 * Generates href to be used with HAL.
 */
export function resolveHref(url: string): string {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return url[0] === '/' ? url : `/${url}`;
  }

  return new URL(url, baseUrl).href;
}
