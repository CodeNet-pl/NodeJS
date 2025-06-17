import { HalLink } from './hal-link';

export type HalResource<TResource, TLinks extends string> = TResource & {
  _links: Record<TLinks, HalLink>;
};
