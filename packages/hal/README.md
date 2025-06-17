# hal

This package exposes basic types for HAL (Hypertext Application Language) links.

```typescript
interface BaseLink {
  href: string;
  method: string;
  templated?: boolean;
  title?: string;
  [key: string]: unknown;
}

export interface PutHalLink extends BaseLink {
  method: 'PUT';
}

export interface PatchHalLink extends BaseLink {
  method: 'PATCH';
}

export interface GetHalLink extends BaseLink {
  method: 'GET';
}

export interface PostHalLink extends BaseLink {
  method: 'POST';
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
```

## Building

Run `nx build hal` to build the library.

## Running unit tests

Run `nx test hal` to execute the unit tests via [Jest](https://jestjs.io).
