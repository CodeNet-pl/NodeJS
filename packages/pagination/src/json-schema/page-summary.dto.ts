import { JsonSchema, Required } from '@code-net/json-schema-class';
import { PageSummary } from '../page-summary';

@JsonSchema()
export class PageSummaryDto implements PageSummary {
  @Required()
  number!: number;

  @Required()
  total!: number;

  @Required()
  limit!: number;

  @Required()
  totalItems!: number;
}
