import {
  Items,
  JsonSchema,
  JsonSchemaResolver,
  Min,
  Optional,
  Required,
  Type,
} from '../src';

import Ajv from 'ajv';

@JsonSchema()
class SchemaTestItemDto {
  @Required()
  @Min(0)
  id!: number;

  @Required()
  a!: string;

  @Required()
  @Type('boolean')
  b!: boolean;

  @Optional()
  c?: string;
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

test('should be able to use AJV for validation', async () => {
  const resolver = new JsonSchemaResolver(
    (schema) => '/definitions/' + schema + '.json#'
  );

  const ajv = new Ajv({ allErrors: true });
  ajv.addSchema(resolver.schema(SchemaTestDto));
  ajv.addSchema(resolver.schema(SchemaTestItemDto));

  const validate = ajv.getSchema(resolver.schemaId(SchemaTestDto))!;
  expect(validate).toBeDefined();

  const validData = {
    items: [
      { id: 1, a: 'test', b: true },
      { id: 2, a: 'test2', b: false, c: 'foo' },
    ],
  };

  expect(validate(validData)).toBe(true);

  const invalidData = {
    items: [{ id: -1, a: 'test', b: 'test' }],
  };

  expect(validate(invalidData)).toBe(false);

  expect(validate.errors).toMatchObject([
    {
      instancePath: '/items/0/id',
      keyword: 'minimum',
      message: 'must be >= 0',
      params: { comparison: '>=', limit: 0 },
      schemaPath: '/definitions/SchemaTestItemDto.json#/properties/id/minimum',
    },
    {
      instancePath: '/items/0/b',
      keyword: 'type',
      message: 'must be boolean',
      params: { type: 'boolean' },
      schemaPath: '/definitions/SchemaTestItemDto.json#/properties/b/type',
    },
  ]);
});
