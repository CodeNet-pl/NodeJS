import { Knex } from 'knex';
import { PageQuery } from '../page-query';
import { Paginated } from '../paginated';

export function paginateKnexQuery<T extends {}>(
  { limit, page }: PageQuery,
  builder: Knex.QueryBuilder<T>
) {
  if (limit > 0) {
    builder.limit(limit);
    if (page > 1) {
      builder.offset((page - 1) * limit);
    }
  }
}

export async function knexQueryToPaginated<T>(
  { limit, page }: PageQuery,
  builder: Knex.QueryBuilder<any, any[]>,
  cb: (
    allBuilder: Knex.QueryBuilder<any, any[]>
  ) => Knex.QueryBuilder<any, any[]> = (b) => b
): Promise<Paginated<T>> {
  const totalResult = await cb(
    builder.clone().clearSelect().clearOrder().clearWhere()
  )
    .limit(1)
    .offset(0)
    .count<[{ count: string }]>();

  const totalItems = parseInt(totalResult[0].count);

  paginateKnexQuery({ limit, page }, builder);

  return {
    page: {
      number: page,
      limit,
      total: Math.ceil(totalItems / limit),
      totalItems,
    },
    items: await cb(builder),
  };
}
