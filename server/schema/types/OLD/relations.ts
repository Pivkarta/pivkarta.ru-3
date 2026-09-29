import { builder } from 'server/schema/builder'
import { OldCompany, OldUser, OldBeer, OldCompanyBeer } from './refs'
import {
  queryCompanies,
  queryUsers,
  queryBeers,
  queryCompanyBeers,
  CompanyWhere,
  CompanyBeerWhere,
} from './queries'
import { paginate, countRows, relatedIds } from './query'

builder.objectFields(OldCompany, (t) => ({
  Owner: t.field({
    type: OldUser,
    nullable: true,
    resolve: (row, _, ctx) =>
      queryUsers(ctx)
        .whereIn(
          'item.id',
          relatedIds(ctx, '_UserOwnedPlaces', 'B', 'A', row.id),
        )
        .first(),
  }),
  beers: t.field({
    type: [OldCompanyBeer],
    nullable: false,
    args: {
      where: t.arg({ type: CompanyBeerWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
    },
    resolve: (row, { where, ...page }, ctx) =>
      paginate(queryCompanyBeers(ctx, { ...where, companyId: row.id }), page),
  }),
  beersCount: t.int({
    nullable: false,
    resolve: (row, _, ctx) =>
      countRows(queryCompanyBeers(ctx, { companyId: row.id })),
  }),
}))
builder.objectFields(OldUser, (t) => ({
  Companies: t.field({
    type: [OldCompany],
    nullable: false,
    args: {
      where: t.arg({ type: CompanyWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
    },
    resolve: (row, { where, ...page }, ctx) =>
      paginate(queryCompanies(ctx, { ...where, ownerId: row.id }), page),
  }),
  companiesCount: t.int({
    nullable: false,
    resolve: (row, _, ctx) =>
      countRows(queryCompanies(ctx, { ownerId: row.id })),
  }),
}))
builder.objectFields(OldBeer, (t) => ({
  places: t.field({
    type: [OldCompanyBeer],
    nullable: false,
    args: {
      where: t.arg({ type: CompanyBeerWhere }),
      take: t.arg.int(),
      skip: t.arg.int(),
    },
    resolve: (row, { where, ...page }, ctx) =>
      paginate(queryCompanyBeers(ctx, { ...where, beerId: row.id }), page),
  }),
  placesCount: t.int({
    nullable: false,
    resolve: (row, _, ctx) =>
      countRows(queryCompanyBeers(ctx, { beerId: row.id })),
  }),
}))
builder.objectFields(OldCompanyBeer, (t) => ({
  Company: t.field({
    type: OldCompany,
    nullable: true,
    resolve: (row, _, ctx) =>
      queryCompanies(ctx)
        .whereIn(
          'item.id',
          relatedIds(ctx, '_PlaceBeerPlace', 'A', 'B', row.id),
        )
        .first(),
  }),
  Beer: t.field({
    type: OldBeer,
    nullable: true,
    resolve: (row, _, ctx) =>
      queryBeers(ctx)
        .whereIn('item.id', relatedIds(ctx, '_PlaceBeerBeer', 'A', 'B', row.id))
        .first(),
  }),
}))
