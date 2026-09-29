import { GraphQLError } from 'graphql'
import type { Knex } from 'knex'
import type { PrismaContext } from 'server/context/interfaces'

export interface PageArgs {
  take?: number | null
  skip?: number | null
  orderBy?: 'id' | 'name' | 'createdAt' | 'updatedAt' | null
  direction?: 'asc' | 'desc' | null
}

export function paginate<T extends object>(
  query: Knex.QueryBuilder<T, T[]>,
  args: PageArgs,
): Knex.QueryBuilder<T, T[]> {
  const take = args.take ?? 20
  const skip = args.skip ?? 0
  if (
    !Number.isInteger(take) ||
    take < 0 ||
    take > 100 ||
    !Number.isInteger(skip) ||
    skip < 0
  ) {
    throw new GraphQLError(
      'take должен быть от 0 до 100, skip — неотрицательным целым числом.',
      { extensions: { code: 'BAD_USER_INPUT' } },
    )
  }
  const field = args.orderBy ?? 'id'
  query.orderBy(`item.${field}`, args.direction ?? 'asc')
  if (field !== 'id') {
    query.orderBy('item.id', 'asc')
  }
  return query.limit(take).offset(skip)
}

export async function countRows<T extends object>(
  query: Knex.QueryBuilder<T, T[]>,
): Promise<number> {
  const row = await query
    .clone()
    .clearSelect()
    .count<{ count: string | number }>({ count: 'item.id' })
    .first()
  return Number(row?.count ?? 0)
}

export function publicUsers<T extends object>(
  query: Knex.QueryBuilder<T, T[]>,
): Knex.QueryBuilder<T, T[]> {
  return query
    .where((q) => q.whereNull('item.hidden').orWhere('item.hidden', 0))
    .where((q) => q.whereNull('item.deleted').orWhere('item.deleted', 0))
}

export function requireSelector(where: object): void {
  if (
    !Object.values(where).some(
      (value) => value !== null && value !== undefined && value !== '',
    )
  ) {
    throw new GraphQLError('Укажите идентификатор или адрес записи.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }
}

export function relatedIds(
  ctx: PrismaContext,
  table: string,
  select: string,
  key: string,
  id: string,
): Knex.QueryBuilder {
  return ctx.knex(table).select(select).where(key, id)
}
