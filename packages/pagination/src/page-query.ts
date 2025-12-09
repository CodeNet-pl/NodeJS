export type PageQuery = {
  limit: number;
  page: number;
};

export function toPageQuery(query: {
  limit?: string | number;
  page?: string | number;
}): PageQuery {
  if (typeof query !== 'object' || query === null) {
    return { limit: 10, page: 1 };
  }
  let limit: number =
    typeof query.limit === 'string'
      ? parseInt(query.limit, 10)
      : typeof query.limit === 'number'
      ? query.limit
      : 10;
  let page: number =
    typeof query.page === 'string'
      ? parseInt(query.page, 10)
      : typeof query.page === 'number'
      ? query.page
      : 1;
  if (!Number.isFinite(limit) || limit < 1) {
    limit = 20;
  }
  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }
  return { limit, page };
}
