# json-schema-class-nestjs-validation-pipe

This library provides a NestJS validation pipe that uses classes transformed to JSON Schema for validation.

## Installation

```bash
npm install json-schema-class json-schema-class-nestjs-validation-pipe ajv ajv-formats
```

## Usage globally

In your app module:

```typescript
import { Module, APP_PIPE } from '@nestjs/common';
import { JsonSchemaClassModule } from '@code-net/json-schema-class';
import { JsonSchemaValidationPipe } from '@code-net/json-schema-class-nestjs-validation-pipe';
import { Enum, Items, JsonSchema, JsonSchemaResolver, Optional, Required, Type } from '@code-net/json-schema-class';

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
  @Type('number')
  id: number;

  @Optional()
  name: string;

  @Required()
  @Items(UserIdentity)
  identities: UserIdentity[];
}

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: JsonSchemaValidationPipe,
    },
  ],
})
export class AppModule {}
```
