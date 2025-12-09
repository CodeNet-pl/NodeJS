import { GetHalLinkDto } from '@code-net/hal-json-schema';
import { JsonSchema, Optional } from '@code-net/json-schema-class';

@JsonSchema()
export class PaginationLinksDto {
  @Optional()
  next?: GetHalLinkDto;

  @Optional()
  self?: GetHalLinkDto;
}
