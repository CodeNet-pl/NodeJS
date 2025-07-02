import { JsonSchemaResolver } from '@code-net/json-schema-class';
import { GetHalLinkDto } from '../src/json-schema';

it('should resolve JSON schema from link', () => {
  const resolver = new JsonSchemaResolver(
    (name) => `/definitions/${name}.json#`
  );

  expect(resolver.schema(GetHalLinkDto)).toEqual({
    $id: '/definitions/GetHalLinkDto.json#',
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      href: {
        type: 'string',
      },
      method: {
        type: 'string',
        const: 'GET',
      },
      title: {
        type: 'string',
      },
      templated: {
        type: 'boolean',
      },
    },
    required: ['href', 'method'],
    additionalProperties: true,
  });
});
