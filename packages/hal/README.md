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
```

## Usage

You can use the types defined in this package to create HAL links in your application. For example:

```typescript
import { GetHalLink } from '@code-net/hal';

class MyHalResourceDto {
  name: string;
  _links: {
    self: GetHalLink;
  };
}
```

See also the following related packages:

- [@code-net/hal-api](https://npmjs.com/package/@code-net/hal-api): Allows you to easily create HAL links in your API responses.
- [@code-net/hal-json-schema](https://npmjs.com/package/@code-net/hal-json-schema): Provides link classes already decorated with [@code-net/json-schema-class](https://npmjs.com/package/@code-net/json-schema-class) decorators, allowing you to transform HAL links into JSON Schema definitions.
- [@code-net/hal-nestjs-swagger](https://npmjs.com/package/@code-net/hal-nestjs-swagger): Provides link classes already decorated for usage with NestJS Swagger.
