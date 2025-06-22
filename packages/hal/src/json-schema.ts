import {
  Const,
  CustomSchema,
  JsonSchema,
  Optional,
  Required,
  Type,
} from '@code-net/json-schema-class';
import {
  DeleteHalLink,
  GetHalLink,
  PatchHalLink,
  PostHalLink,
  PutHalLink,
} from './hal-link';

@JsonSchema({
  additionalProperties: true,
})
export class PutHalLinkDto implements PutHalLink {
  @Required()
  href!: string;

  @Required()
  @CustomSchema('const', 'PUT')
  method!: 'PUT';

  @Optional()
  title?: string;

  @Optional()
  @Type('boolean')
  templated?: boolean;

  [key: string]: unknown;
}

@JsonSchema({
  additionalProperties: true,
})
export class PatchHalLinkDto implements PatchHalLink {
  @Required()
  href!: string;

  @Required()
  @CustomSchema('const', 'PATCH')
  method!: 'PATCH';

  @Optional()
  title?: string;

  @Optional()
  @Type('boolean')
  templated?: boolean;

  [key: string]: unknown;
}

@JsonSchema({
  additionalProperties: true,
})
export class GetHalLinkDto implements GetHalLink {
  @Required()
  href!: string;

  @Required()
  @Const('GET')
  method!: 'GET';

  @Optional()
  @Type('string')
  title?: string;

  @Optional()
  @Type('boolean')
  templated?: boolean | undefined;

  [key: string]: unknown;
}

@JsonSchema({
  additionalProperties: true,
})
export class PostHalLinkDto implements PostHalLink {
  @Required()
  href!: string;

  @Required()
  @CustomSchema('const', 'POST')
  method!: 'POST';

  @Optional()
  title?: string;

  @Optional()
  @Type('boolean')
  templated?: boolean;

  [key: string]: unknown;
}

@JsonSchema({
  additionalProperties: true,
})
export class DeleteHalLinkDto implements DeleteHalLink {
  @Required()
  href!: string;

  @Required()
  @CustomSchema('const', 'DELETE')
  method!: 'DELETE';

  @Optional()
  title?: string;

  @Optional()
  @Type('boolean')
  templated?: boolean;

  [key: string]: unknown;
}
