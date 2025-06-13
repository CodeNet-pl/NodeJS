import {
  Format,
  Items,
  JsonSchema,
  JsonSchemaResolver,
  Min,
  Optional,
  Required,
} from '../src';

@JsonSchema()
class SchemaTestItemDto {
  @Required()
  @Min(0)
  id!: number;

  @Required()
  a!: string;

  @Required()
  b!: string;

  @Optional()
  @Format('date')
  c?: Date;
}

@JsonSchema()
class SchemaTestDto {
  $schema!: string;

  @Required()
  @Items(SchemaTestItemDto)
  items!: SchemaTestItemDto[];

  constructor({ items }: SchemaTestDto) {
    this.items = items;
  }
}

class NoSchemaDto {
  foo: string;

  constructor({ foo }: NoSchemaDto) {
    this.foo = foo;
  }
}

describe('JsonSchema', () => {
  test(`should enrich a simple object with json schema url`, async () => {
    const resolver = new JsonSchemaResolver(
      (schema) => 'http://localhost/schemas/' + schema + '.json?version=1.2.3'
    );

    const schema = resolver.schema(SchemaTestDto);
    expect(schema).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'http://localhost/schemas/SchemaTestDto.json?version=1.2.3',
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            $ref: 'http://localhost/schemas/SchemaTestItemDto.json?version=1.2.3',
          },
        },
      },
      required: ['items'],
    });
  });

  test('should get schema reference from registry', () => {
    const resolver = new JsonSchemaResolver(
      (schema) => 'http://localhost/schemas/' + schema + '.json?version=1.2.3'
    );

    expect(resolver.schemaRef(SchemaTestDto)).toEqual({
      $ref: 'http://localhost/schemas/SchemaTestDto.json?version=1.2.3',
    });
  });
});
