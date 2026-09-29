import { builder } from 'server/schema/builder'
import { OldBeer } from '../refs'
import { nullableNumber } from '../values'
import { legacyJson } from '../values'

builder.objectType(OldBeer, {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    beer_id: t.exposeInt('beer_id', { nullable: true }),
    num_comments: t.exposeInt('num_comments', { nullable: true }),
    num_photos: t.exposeInt('num_photos', { nullable: true }),
    container: t.exposeInt('container', { nullable: true }),
    bitter: t.exposeInt('bitter', { nullable: true }),
    type_id: t.exposeInt('type_id', { nullable: true }),
    is_request: t.exposeInt('is_request', { nullable: true }),
    created_at: t.exposeInt('created_at', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    url_name: t.exposeString('url_name', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    country: t.exposeString('country', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    manufacturer: t.exposeString('manufacturer', { nullable: true }),
    region: t.exposeString('region', { nullable: true }),
    manufacture_years: t.exposeString('manufacture_years', { nullable: true }),
    alcohol: t.exposeString('alcohol', { nullable: true }),
    wort_percent: t.exposeString('wort_percent', { nullable: true }),
    components: t.exposeString('components', { nullable: true }),
    color: t.exposeString('color', { nullable: true }),
    rating: t.float({
      nullable: true,
      resolve: (row) => nullableNumber(row.rating),
    }),
    filtered: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.filtered === null || row.filtered === undefined
          ? null
          : Boolean(row.filtered),
    }),
    pasteurized: t.boolean({
      nullable: true,
      resolve: (row) =>
        row.pasteurized === null || row.pasteurized === undefined
          ? null
          : Boolean(row.pasteurized),
    }),
    editor_content: t.field({
      type: 'Json',
      nullable: true,
      resolve: (row) => legacyJson(row.editor_content),
    }),
    gallery: t.field({
      type: 'Json',
      nullable: true,
      resolve: (row) => legacyJson(row.gallery),
    }),
  }),
})
