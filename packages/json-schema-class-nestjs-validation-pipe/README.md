# json-schema-class-nestjs-validation-pipe

This library provides a NestJS validation pipe that uses classes transformed to JSON Schema for validation.

## Installation

```bash
npm install json-schema-class json-schema-class-nestjs-validation-pipe ajv ajv-formats
```

## Usage globally

In your app module:

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JsonSchemaValidationPipe } from '@code-net/json-schema-class-nestjs-validation-pipe';
import { Enum, Items, JsonSchema, JsonSchemaResolver, Optional, Required, Type } from '@code-net/json-schema-class';

@JsonSchema()
class UserIdentityDto {
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
class RegisterUserDto {
  @Required()
  @Type('number')
  id: number;

  @Optional()
  name: string;

  @Required()
  @Items(UserIdentityDto)
  identities: UserIdentityDto[];
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

Then you can use the `RegisterUserDto` class in your controllers:

```typescript
class UserController {
  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    // user was validated against the JSON Schema
  }
}
```

## Usage in a specific controller

You can also use the `JsonSchemaValidationPipe` in a specific controller or route handler:

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { JsonSchemaValidationPipe } from '@code-net/json-schema-class-nestjs-validation-pipe';
import { RegisterUserDto } from './register-user.dto';

@Controller('user')
export class UserController {
  @Post('register')
  @UsePipes(new JsonSchemaValidationPipe())
  async register(@Body() user: RegisterUserDto) {
    // user was validated with AJV against the JSON Schema
  }
}
```

## Customizing the Pipe

You can customize the `JsonSchemaValidationPipe` by passing options to its constructor:

```typescript
import { JsonSchemaResolver } from '@code-net/json-schema-class';
import { JsonSchemaValidationPipe } from '@code-net/json-schema-class-nestjs-validation-pipe';
import Ajv from 'ajv';

const resolver = new JsonSchemaResolver(
  (name) => `/definitions/${name}.json#`
)

const ajv = new Ajv({
  // Custom AJV options 
  allErrors: true,
  coerceTypes: true,
  // Pass all the JSON schemas (mandatory)
  schemas: resolver.all(),
});

new JsonSchemaValidationPipe({
  ajv, // Custom AJV instance
  resolver, // Custom resolver
  createError: ({ errors }) => {
    // Custom error handling
    return new BadRequestException(ajv.errorsText(errors));
  },
});
```
