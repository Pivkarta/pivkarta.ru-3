import { builder } from 'server/schema/builder'
import { OldCompanyBeer } from '../refs'
import { nullableNumber } from '../values'

builder.objectType(OldCompanyBeer, {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    price: t.float({
      nullable: true,
      resolve: (row) => nullableNumber(row.price),
    }),
  }),
})
