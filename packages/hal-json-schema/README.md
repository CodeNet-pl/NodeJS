# hal-json-schema

This library was generated with [Nx](https://nx.dev).

## Usage with @code-net/json-schema-class

Install `@code-net/json-schema-class` to use the JSON Schema annotations.

```bash
npm install @code-net/hal @code-net/json-schema-class
```

```typescript
import { GetHalLinkDto } from '@code-net/hal-json-schema';
import { JsonSchema, Required, JsonSchemaResolver } from '@code-net/json-schema-class';

@JsonSchema()
class MyLinks {
  @Required()
  self: GetHalLinkDto;
}

const resolver = new JsonSchemaResolver();

console.log(resolver.resolve(MyLinks));
```

// Output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/definitions/MyLinks.json#",
  "type": "object",
  "properties": {
    "self": {
      "$ref": "/definitions/GetHalLinkDto.json#"
    }
  },
  "required": ["self"],
}
```

```typescript

console.log(resolver.resolve(GetHalLinkDto));
```

// Output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "href": {
      "type": "string",
      "format": "uri"
    },
    "method": {
      "type": "string",
      "enum": ["GET", "POST", "PUT", "DELETE"]
    },
    "title": {
      "type": "string"
    }
  },
  "required": ["href", "method"]
}
```
