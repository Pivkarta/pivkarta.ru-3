import { builder } from 'server/schema/builder'
import { OldCompany } from '../refs'
import { nullableNumber } from '../values'
import { legacyJson } from '../values'

builder.objectType(OldCompany, {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    place_id: t.exposeInt('place_id', { nullable: true }),
    city_id: t.exposeInt('city_id', { nullable: true }),
    num_comments: t.exposeInt('num_comments', { nullable: true }),
    num_photos: t.exposeInt('num_photos', { nullable: true }),
    num_votes: t.exposeInt('num_votes', { nullable: true }),
    is_request: t.exposeInt('is_request', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    address: t.exposeString('address', { nullable: true }),
    website: t.exposeString('website', { nullable: true }),
    phone: t.exposeString('phone', { nullable: true }),
    work_hours: t.exposeString('work_hours', { nullable: true }),
    metro: t.exposeString('metro', { nullable: true }),
    url_name: t.exposeString('url_name', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    lng: t.float({ nullable: true, resolve: (row) => nullableNumber(row.lng) }),
    lat: t.float({ nullable: true, resolve: (row) => nullableNumber(row.lat) }),
    rating_average: t.float({
      nullable: true,
      resolve: (row) => nullableNumber(row.rating_average),
    }),
    is_bar: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.is_bar === null || row.is_bar === undefined
          ? null
          : Boolean(row.is_bar),
    }),
    is_shop: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.is_shop === null || row.is_shop === undefined
          ? null
          : Boolean(row.is_shop),
    }),
    is_brewery: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.is_brewery === null || row.is_brewery === undefined
          ? null
          : Boolean(row.is_brewery),
    }),
    active: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.active === null || row.active === undefined
          ? null
          : Boolean(row.active),
    }),
    best: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.best === null || row.best === undefined ? null : Boolean(row.best),
    }),
    wifi: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.wifi === null || row.wifi === undefined ? null : Boolean(row.wifi),
    }),
    tv: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.tv === null || row.tv === undefined ? null : Boolean(row.tv),
    }),
    content: t.field({
      type: 'Json',
      nullable: true,
      resolve: (row) => legacyJson(row.content),
    }),
    schedules: t.field({
      type: 'Json',
      nullable: true,
      resolve: (row) => legacyJson(row.schedules),
    }),
    gallery: t.field({
      type: 'Json',
      nullable: true,
      resolve: (row) => legacyJson(row.gallery),
    }),
    uri: t.string({
      nullable: false,
      resolve: (row) =>
        `/place/${row.place_id}/${row.url_name ? `${encodeURIComponent(row.url_name)}/` : ''}`,
    }),
  }),
})
