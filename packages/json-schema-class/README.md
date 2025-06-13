# json-schema-class

This package provides JSON Schema Registry functionality, allowing you to manage and validate JSON schemas.

It builds on top of `ts-decorator-json-schema-generator` package to translate classes into JSON Schema definitions.

## Usage

You can register JSON Schema for classes:

```typescript
import { Enum, Items, JsonSchema, JsonSchemaResolver, Required, Optional } from '@code-net/json-schema-class';

@JsonSchema()
class UserIdentity {
  @Required()
  id: string;

  @Optional()
  @Enum(['google', 'github', 'email'])
  provider: string;
}

@JsonSchema({
  title: 'User',
  description: 'Just a user example',
})
class User {
  @Required()
  id: string;

  @Optional()
  name: string;

  @Required()
  @Items(UserIdentity)
  identities: UserIdentity[];
}

const resolver = new JsonSchemaResolver((name) => `http://example.com/schemas/v1.2.3/${name}.json`);

console.log(resolver.schema(User));
```

Output:

```json
{
  "$id": "http://example.com/schemas/v1.2.3/User.json",
  "title": "User",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "identities": {
      "type": "array",
      "items": {
        "$ref": "http://example.com/schemas/v1.2.3/UserIdentity.json"
      }
    }
  },
  "required": ["id"]
}
```

You can also get the schema reference or ID for a class:

```typescript
console.log(resolver.schemaRef(User));
```

Output:

```json
{
  "$ref": "http://example.com/schemas/v1.2.3/User.json"
}
```

You can retrieve the schema ID for a class:

```typescript
console.log(resolver.schemaId(User));
```

Output:

```txt
http://example.com/schemas/v1.2.3/User.json
```

Even though this is designated to transform classes into JSON Schema definitions, you can also register raw JSON Schema definitions:

```typescript
import { JsonSchemaRegistry, JsonSchemaResolver } from '@code-net/json-schema-class';

const registry = JsonSchemaRegistry.getInstance();
const resolver = new JsonSchemaResolver((name) => `http://example.com/schemas/v1.2.3/${name}.json`);

registry.registerSchema({
  $id: 'RawSchema',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id'],
});
```

Then you can resolve the schema as before by its name.

```typescript
console.log(resolver.schema('RawSchema'));
```

You can use separate registries and resolvers:

```typescript
import { JsonSchemaRegistry, JsonSchemaResolver } from '@code-net/json-schema-class';

const registry = new JsonSchemaRegistry();
const resolver = new JsonSchemaResolver((name) => `http://example.com/schemas/v1.2.3/${name}.json`, registry);
// resolver will use the provided registry
```

Note that classes registered with `@JsonSchema()` decorator will not be available in custom registries/resolvers unless you register them manually.

```typescript
registry.registerClass(SomeClass);
registry.registerSchema({
  // ...  
});
```
