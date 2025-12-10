import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { withBaseUrl } from './hook';

export interface HalPluginOptions {
  /** Override the protocol (e.g., 'https'). Falls back to x-forwarded-proto header or request protocol. */
  protocol?: string;
  /** Override the host (e.g., 'api.example.com'). Falls back to x-forwarded-host or host header. */
  host?: string;
  /** Override the prefix (e.g., '/api/v1'). Falls back to x-forwarded-prefix header or '/'. */
  prefix?: string;
}

/**
 * Creates a preHandler hook that sets up HAL base URL from request headers.
 * Useful for generating proper HAL links in responses.
 *
 * @param options - Optional overrides for protocol, host, and prefix
 * @returns A Fastify preHandler hook function
 */
function createHalPreHandler(options: HalPluginOptions = {}) {
  return (req: FastifyRequest, reply: unknown, next: () => void) => {
    const protocol =
      options.protocol ?? req.headers['x-forwarded-proto'] ?? req.protocol;
    const host =
      options.host ?? req.headers['x-forwarded-host'] ?? req.headers['host'];
    const prefix = options.prefix ?? req.headers['x-forwarded-prefix'] ?? '/';

    withBaseUrl(`${protocol}://${host}${prefix}`, next);
  };
}

/**
 * Fastify plugin that automatically sets up HAL base URL for all requests.
 * The base URL is derived from request headers (x-forwarded-proto, x-forwarded-host, x-forwarded-prefix)
 * or can be overridden via plugin options.
 *
 * @example
 * ```ts
 * import halPlugin from './hal';
 *
 * fastify.register(halPlugin, {
 *   protocol: 'https',
 *   prefix: '/api/v1'
 * });
 * ```
 */
export function halPlugin(
  fastify: FastifyInstance,
  opts: HalPluginOptions,
  done: (err?: Error) => void
) {
  fastify.addHook('preHandler', createHalPreHandler(opts));
  done();
}

export default fp(halPlugin, {
  fastify: '>=4.x',
  name: 'fastify-hal-links',
});
