interface BaseLink {
  href: string;
  method: string;
  templated?: boolean;
  title?: string;
  [key: string]: unknown;
}

export interface GetHalLink extends BaseLink {
  method: 'GET';
}

export interface PostHalLink extends BaseLink {
  method: 'POST';
}

export interface PutHalLink extends BaseLink {
  method: 'PUT';
}

export interface PatchHalLink extends BaseLink {
  method: 'PATCH';
}

export interface DeleteHalLink extends BaseLink {
  method: 'DELETE';
}

export type HalLink =
  | GetHalLink
  | PostHalLink
  | PutHalLink
  | PatchHalLink
  | DeleteHalLink;
