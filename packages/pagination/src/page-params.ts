import { PageSummary } from './page-summary';

export function hasNextPage({ number, limit, totalItems }: PageSummary) {
  return Math.ceil(totalItems / limit) > number;
}

export function nextPageParams({ number, limit }: PageSummary) {
  return {
    page: number + 1,
    limit,
  };
}
