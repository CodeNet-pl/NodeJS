import { HalLink } from '@code-net/hal';
import { resolveHref } from './hook';

/**
 * Middleware which runs before returning a HAL link.
 */
export interface HalLinkMiddleware {
  use(link: HalLink): HalLink;
}

const linkMiddlewares: HalLinkMiddleware[] = [];

/**
 * Generates a link object with the given parameters.
 */
export function resolveLink(link: HalLink): HalLink {
  link = linkMiddlewares.reduce((acc, next) => {
    return next.use(acc);
  }, link);

  return {
    ...link,
    href: resolveHref(link.href),
    method: link.method ?? 'GET',
  };
}
