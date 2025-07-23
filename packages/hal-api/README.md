# hal-api

This library makes it easier to create HAL (Hypertext Application Language) links in your API responses.

## Installation

Install `@code-net/hal-api` to use the HAL link classes.

```bash
npm install @code-net/hal-api
```

## Usage

### Express

Usage with express API.

```typescript
import { resolveHref } from '@code-net/hal-api';
import { halLinks } from '@code-net/hal-api/express';

const app = express();
app.use(halLinks);

app.get('/api/resource', (req, res) => {
  const resource = {
    name: 'Example Resource',
    _links: {
      self: { href: resolveHref('/resource'), method: 'GET' },
      related: { href: resolveHref('/related-resource'), method: 'GET' },
    },
  };
  res.json(resource);
});
```

Make a request to your API:

```bash
curl http://localhost:3000/api/resource
```

```json
{
  "name": "Example Resource",
  "_links": {
    "self": {
      "href": "http://localhost:3000/api/resource",
      "method": "GET"
    },
    "related": {
      "href": "http://localhost:3000/api/related-resource",
      "method": "GET"
    }
  }
}
```

It can handle the `X-Forwarded-*` headers to build correct URLs, so you can use it behind a reverse proxy or load balancer.

```bash
curl -H "X-Forwarded-Proto: https" \
     -H "X-Forwarded-Host: example.com" \
     -H "X-Forwarded-Prefix: /api" \
     http://localhost:3000/resource
```

Response JSON:

```json
{
  "name": "Example Resource",
  "_links": {
    "self": {
      "href": "https://example.com/api/resource",
      "method": "GET"
    },
    "related": {
      "href": "https://example.com/api/related-resource",
      "method": "GET"
    }
  }
}
```

### NestJS

Usage with NestJS API.

```typescript
import { Controller, Get, Post, Query } from '@nestjs/common';
import { routeLink } from '@code-net/hal-api/nestjs';

@Controller('hals')
class HalController {
  // The URL can contain slashes
  @Get()
  async get() {
    return {
      _links: {
        post: routeLink(this, 'post', { params: { id: '123', foo: 'test', bar: ['A', 'B'] } }),
      },
    };
  }

  @Post(':id/post')
  async post(@Query('foo') foo: string, @Query('bar') bar: string[]) {
    // Logic here
  }
}
```

```bash
curl http://localhost:3000/hals
```

```json
{
  "_links": {
    "post": {
      "href": "http://localhost:3000/hals/123/post?foo=test&bar[]=A&bar[]=B",
      "method": "POST"
    }
  }
}
```
