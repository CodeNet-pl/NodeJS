import { PageSummary } from './page-summary';

export type Paginated<T> = {
  items: T[];
  page: PageSummary;
};
