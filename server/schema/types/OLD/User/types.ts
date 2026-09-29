import { builder } from 'server/schema/builder'
import { OldUser } from '../refs'
import { nullableNumber } from '../values'

builder.objectType(OldUser, {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    user_id: t.exposeInt('user_id', { nullable: true }),
    city_id: t.exposeInt('city_id', { nullable: true }),
    username: t.exposeString('username', { nullable: true }),
    fullname: t.exposeString('fullname', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    photo: t.exposeString('photo', { nullable: true }),
    about: t.exposeString('about', { nullable: true }),
    www: t.exposeString('www', { nullable: true }),
    rating: t.float({
      nullable: true,
      resolve: (row) => nullableNumber(row.rating),
    }),
  }),
})
