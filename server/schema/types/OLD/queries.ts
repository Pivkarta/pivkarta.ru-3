import { builder } from 'server/schema/builder'
import type { Knex } from 'knex'
import type { PrismaContext } from 'server/context/interfaces'
import {
  paginate,
  countRows,
  publicUsers,
  requireSelector,
  relatedIds,
} from './query'
import { OldCompany } from './refs'
import type { CompanyRow } from './Company/interfaces'
import { OldUser } from './refs'
import type { UserRow } from './User/interfaces'
import { OldBeer } from './refs'
import type { BeerRow } from './Beer/interfaces'
import { OldCompanyBeer } from './refs'
import type { CompanyBeerRow } from './CompanyBeer/interfaces'

const SortDirection = builder.enumType('OldSortDirection', {
  values: ['asc', 'desc'] as const,
})
const SortOrder = builder.enumType('OldSortOrder', {
  values: ['id', 'name', 'createdAt', 'updatedAt'] as const,
})
const BasicSortOrder = builder.enumType('OldBasicSortOrder', {
  values: ['id', 'createdAt', 'updatedAt'] as const,
})

export interface CompanyFilter {
  id?: string | null
  place_id?: number | null
  city_id?: number | null
  active?: boolean | null
  is_bar?: boolean | null
  is_shop?: boolean | null
  is_brewery?: boolean | null
  name?: string | null
  url_name?: string | null
  ownerId?: string | null
  beerId?: string | null
}
export const CompanyWhere = builder
  .inputRef<CompanyFilter>('OldCompanyWhereInput')
  .implement({
    fields: (t) => ({
      id: t.string(),
      place_id: t.int(),
      city_id: t.int(),
      active: t.boolean(),
      is_bar: t.boolean(),
      is_shop: t.boolean(),
      is_brewery: t.boolean(),
      name: t.string(),
      url_name: t.string(),
      ownerId: t.string(),
      beerId: t.string(),
    }),
  })

export function queryCompanies(
  ctx: PrismaContext,
  where: CompanyFilter = {},
): Knex.QueryBuilder<CompanyRow, CompanyRow[]> {
  const query = ctx
    .knex<CompanyRow>('Place as item')
    .select(
      'item.id',
      'item.createdAt',
      'item.updatedAt',
      'item.place_id',
      'item.city_id',
      'item.num_comments',
      'item.num_photos',
      'item.num_votes',
      'item.is_request',
      'item.name',
      'item.description',
      'item.address',
      'item.website',
      'item.phone',
      'item.work_hours',
      'item.metro',
      'item.url_name',
      'item.image',
      'item.email',
      'item.lng',
      'item.lat',
      'item.rating_average',
      'item.is_bar',
      'item.is_shop',
      'item.is_brewery',
      'item.active',
      'item.best',
      'item.wifi',
      'item.tv',
      'item.content',
      'item.schedules',
      'item.gallery',
    )
  if (where.id !== null && where.id !== undefined) {
    query.where('item.id', where.id)
  }
  if (where.place_id !== null && where.place_id !== undefined) {
    query.where('item.place_id', where.place_id)
  }
  if (where.city_id !== null && where.city_id !== undefined) {
    query.where('item.city_id', where.city_id)
  }
  if (where.active !== null && where.active !== undefined) {
    query.where('item.active', where.active)
  }
  if (where.is_bar !== null && where.is_bar !== undefined) {
    query.where('item.is_bar', where.is_bar)
  }
  if (where.is_shop !== null && where.is_shop !== undefined) {
    query.where('item.is_shop', where.is_shop)
  }
  if (where.is_brewery !== null && where.is_brewery !== undefined) {
    query.where('item.is_brewery', where.is_brewery)
  }
  if (where.name !== null && where.name !== undefined) {
    query.whereRaw("?? LIKE ? ESCAPE '!'", [
      'item.name',
      `%${where.name.replace(/[!%_]/g, '!$&')}%`,
    ])
  }
  if (where.url_name !== null && where.url_name !== undefined) {
    query.where('item.url_name', where.url_name)
  }
  if (where.ownerId !== null && where.ownerId !== undefined) {
    query.whereIn(
      'item.id',
      relatedIds(ctx, '_UserOwnedPlaces', 'A', 'B', where.ownerId),
    )
  }
  if (where.beerId !== null && where.beerId !== undefined) {
    query.whereIn(
      'item.id',
      ctx
        .knex('_PlaceBeerPlace')
        .select('A')
        .whereIn(
          'B',
          relatedIds(ctx, '_PlaceBeerBeer', 'B', 'A', where.beerId),
        ),
    )
  }
  return query
}

builder.queryField('oldCompanies', (t) =>
  t.field({
    type: [OldCompany],
    nullable: false,
    args: {
      where: t.arg({ type: CompanyWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
      orderBy: t.arg({ type: SortOrder }),
      direction: t.arg({ type: SortDirection }),
    },
    resolve: (_, { where, ...page }, ctx) =>
      paginate(queryCompanies(ctx, where ?? {}), page),
  }),
)
builder.queryField('oldCompaniesCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: CompanyWhere }) },
    resolve: (_, { where }, ctx) => countRows(queryCompanies(ctx, where ?? {})),
  }),
)
builder.queryField('oldCompany', (t) =>
  t.field({
    type: OldCompany,
    nullable: true,
    args: {
      id: t.arg.string(),
      place_id: t.arg.int(),
      url_name: t.arg.string(),
    },
    resolve: (_, args, ctx) => {
      requireSelector(args)
      return queryCompanies(ctx, args).first()
    },
  }),
)

export interface UserFilter {
  id?: string | null
  user_id?: number | null
  city_id?: number | null
  username?: string | null
  fullname?: string | null
}
export const UserWhere = builder
  .inputRef<UserFilter>('OldUserWhereInput')
  .implement({
    fields: (t) => ({
      id: t.string(),
      user_id: t.int(),
      city_id: t.int(),
      username: t.string(),
      fullname: t.string(),
    }),
  })

export function queryUsers(
  ctx: PrismaContext,
  where: UserFilter = {},
): Knex.QueryBuilder<UserRow, UserRow[]> {
  const query = ctx
    .knex<UserRow>('User as item')
    .select(
      'item.id',
      'item.createdAt',
      'item.updatedAt',
      'item.user_id',
      'item.city_id',
      'item.username',
      'item.fullname',
      'item.image',
      'item.photo',
      'item.about',
      'item.www',
      'item.rating',
    )
  publicUsers(query)
  if (where.id !== null && where.id !== undefined) {
    query.where('item.id', where.id)
  }
  if (where.user_id !== null && where.user_id !== undefined) {
    query.where('item.user_id', where.user_id)
  }
  if (where.city_id !== null && where.city_id !== undefined) {
    query.where('item.city_id', where.city_id)
  }
  if (where.username !== null && where.username !== undefined) {
    query.where('item.username', where.username)
  }
  if (where.fullname !== null && where.fullname !== undefined) {
    query.whereRaw("?? LIKE ? ESCAPE '!'", [
      'item.fullname',
      `%${where.fullname.replace(/[!%_]/g, '!$&')}%`,
    ])
  }
  return query
}

builder.queryField('oldUsers', (t) =>
  t.field({
    type: [OldUser],
    nullable: false,
    args: {
      where: t.arg({ type: UserWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
      orderBy: t.arg({ type: BasicSortOrder }),
      direction: t.arg({ type: SortDirection }),
    },
    resolve: (_, { where, ...page }, ctx) =>
      paginate(queryUsers(ctx, where ?? {}), page),
  }),
)
builder.queryField('oldUsersCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: UserWhere }) },
    resolve: (_, { where }, ctx) => countRows(queryUsers(ctx, where ?? {})),
  }),
)
builder.queryField('oldUser', (t) =>
  t.field({
    type: OldUser,
    nullable: true,
    args: {
      id: t.arg.string(),
      user_id: t.arg.int(),
      username: t.arg.string(),
    },
    resolve: (_, args, ctx) => {
      requireSelector(args)
      return queryUsers(ctx, args).first()
    },
  }),
)

export interface BeerFilter {
  id?: string | null
  beer_id?: number | null
  name?: string | null
  url_name?: string | null
  country?: string | null
  manufacturer?: string | null
  type_id?: number | null
  color?: string | null
  filtered?: boolean | null
  pasteurized?: boolean | null
  companyId?: string | null
}
export const BeerWhere = builder
  .inputRef<BeerFilter>('OldBeerWhereInput')
  .implement({
    fields: (t) => ({
      id: t.string(),
      beer_id: t.int(),
      name: t.string(),
      url_name: t.string(),
      country: t.string(),
      manufacturer: t.string(),
      type_id: t.int(),
      color: t.string(),
      filtered: t.boolean(),
      pasteurized: t.boolean(),
      companyId: t.string(),
    }),
  })

export function queryBeers(
  ctx: PrismaContext,
  where: BeerFilter = {},
): Knex.QueryBuilder<BeerRow, BeerRow[]> {
  const query = ctx
    .knex<BeerRow>('Beer as item')
    .select(
      'item.id',
      'item.createdAt',
      'item.updatedAt',
      'item.beer_id',
      'item.num_comments',
      'item.num_photos',
      'item.container',
      'item.bitter',
      'item.type_id',
      'item.is_request',
      'item.created_at',
      'item.name',
      'item.url_name',
      'item.description',
      'item.country',
      'item.image',
      'item.manufacturer',
      'item.region',
      'item.manufacture_years',
      'item.alcohol',
      'item.wort_percent',
      'item.components',
      'item.color',
      'item.rating',
      'item.filtered',
      'item.pasteurized',
      'item.editor_content',
      'item.gallery',
    )
  if (where.id !== null && where.id !== undefined) {
    query.where('item.id', where.id)
  }
  if (where.beer_id !== null && where.beer_id !== undefined) {
    query.where('item.beer_id', where.beer_id)
  }
  if (where.name !== null && where.name !== undefined) {
    query.whereRaw("?? LIKE ? ESCAPE '!'", [
      'item.name',
      `%${where.name.replace(/[!%_]/g, '!$&')}%`,
    ])
  }
  if (where.url_name !== null && where.url_name !== undefined) {
    query.where('item.url_name', where.url_name)
  }
  if (where.country !== null && where.country !== undefined) {
    query.where('item.country', where.country)
  }
  if (where.manufacturer !== null && where.manufacturer !== undefined) {
    query.whereRaw("?? LIKE ? ESCAPE '!'", [
      'item.manufacturer',
      `%${where.manufacturer.replace(/[!%_]/g, '!$&')}%`,
    ])
  }
  if (where.type_id !== null && where.type_id !== undefined) {
    query.where('item.type_id', where.type_id)
  }
  if (where.color !== null && where.color !== undefined) {
    query.where('item.color', where.color)
  }
  if (where.filtered !== null && where.filtered !== undefined) {
    query.where('item.filtered', where.filtered)
  }
  if (where.pasteurized !== null && where.pasteurized !== undefined) {
    query.where('item.pasteurized', where.pasteurized)
  }
  if (where.companyId !== null && where.companyId !== undefined) {
    query.whereIn(
      'item.id',
      ctx
        .knex('_PlaceBeerBeer')
        .select('A')
        .whereIn(
          'B',
          relatedIds(ctx, '_PlaceBeerPlace', 'B', 'A', where.companyId),
        ),
    )
  }
  return query
}

builder.queryField('oldBeers', (t) =>
  t.field({
    type: [OldBeer],
    nullable: false,
    args: {
      where: t.arg({ type: BeerWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
      orderBy: t.arg({ type: SortOrder }),
      direction: t.arg({ type: SortDirection }),
    },
    resolve: (_, { where, ...page }, ctx) =>
      paginate(queryBeers(ctx, where ?? {}), page),
  }),
)
builder.queryField('oldBeersCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: BeerWhere }) },
    resolve: (_, { where }, ctx) => countRows(queryBeers(ctx, where ?? {})),
  }),
)
builder.queryField('oldBeer', (t) =>
  t.field({
    type: OldBeer,
    nullable: true,
    args: {
      id: t.arg.string(),
      beer_id: t.arg.int(),
      url_name: t.arg.string(),
    },
    resolve: (_, args, ctx) => {
      requireSelector(args)
      return queryBeers(ctx, args).first()
    },
  }),
)

export interface CompanyBeerFilter {
  id?: string | null
  companyId?: string | null
  beerId?: string | null
  minPrice?: number | null
  maxPrice?: number | null
}
export const CompanyBeerWhere = builder
  .inputRef<CompanyBeerFilter>('OldCompanyBeerWhereInput')
  .implement({
    fields: (t) => ({
      id: t.string(),
      companyId: t.string(),
      beerId: t.string(),
      minPrice: t.float(),
      maxPrice: t.float(),
    }),
  })

export function queryCompanyBeers(
  ctx: PrismaContext,
  where: CompanyBeerFilter = {},
): Knex.QueryBuilder<CompanyBeerRow, CompanyBeerRow[]> {
  const query = ctx
    .knex<CompanyBeerRow>('PlaceBeer as item')
    .select('item.id', 'item.createdAt', 'item.updatedAt', 'item.price')
  if (where.id !== null && where.id !== undefined) {
    query.where('item.id', where.id)
  }
  if (where.companyId !== null && where.companyId !== undefined) {
    query.whereIn(
      'item.id',
      relatedIds(ctx, '_PlaceBeerPlace', 'B', 'A', where.companyId),
    )
  }
  if (where.beerId !== null && where.beerId !== undefined) {
    query.whereIn(
      'item.id',
      relatedIds(ctx, '_PlaceBeerBeer', 'B', 'A', where.beerId),
    )
  }
  if (where.minPrice !== null && where.minPrice !== undefined) {
    query.where('item.price', '>=', where.minPrice)
  }
  if (where.maxPrice !== null && where.maxPrice !== undefined) {
    query.where('item.price', '<=', where.maxPrice)
  }
  return query
}

builder.queryField('oldCompanyBeers', (t) =>
  t.field({
    type: [OldCompanyBeer],
    nullable: false,
    args: {
      where: t.arg({ type: CompanyBeerWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
      orderBy: t.arg({ type: BasicSortOrder }),
      direction: t.arg({ type: SortDirection }),
    },
    resolve: (_, { where, ...page }, ctx) =>
      paginate(queryCompanyBeers(ctx, where ?? {}), page),
  }),
)
builder.queryField('oldCompanyBeersCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: CompanyBeerWhere }) },
    resolve: (_, { where }, ctx) =>
      countRows(queryCompanyBeers(ctx, where ?? {})),
  }),
)
builder.queryField('oldCompanyBeer', (t) =>
  t.field({
    type: OldCompanyBeer,
    nullable: true,
    args: { id: t.arg.string() },
    resolve: (_, args, ctx) => {
      requireSelector(args)
      return queryCompanyBeers(ctx, args).first()
    },
  }),
)
