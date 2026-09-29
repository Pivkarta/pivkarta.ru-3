import type { Knex } from 'knex'
import { data } from 'react-router'
import { knexClient as db } from '../knex'
import {
  queryBeers,
  queryCompanies,
  queryUsers,
} from '../schema/types/OLD/queries'
import type {
  BeerFilter,
  CompanyFilter,
  UserFilter,
} from '../schema/types/OLD/queries'
import type { BeerRow } from '../schema/types/OLD/Beer/interfaces'
import type { CompanyRow } from '../schema/types/OLD/Company/interfaces'
import type { UserRow } from '../schema/types/OLD/User/interfaces'
import type { PublicLink, PublicSection } from '../../app/pages/Public/types'
import {
  objectPath,
  profilePath,
  topicPath,
  commentPath,
} from '../../app/pages/Public/paths'
import { imageUrl, renderContent, plainText } from './content'

export interface CityRow {
  id: string
  city_id: number
  name: string
  alias: string
  lat: number
  lng: number
}
export interface TopicRow {
  id: string
  topic_id: number
  name: string
  url_name: string | null
  description: string | null
  editor_content: unknown
  created_at: Date
  published: boolean
}
export interface CommentRow {
  id: string
  comment_id: number
  object_id: number | null
  type_id: number
  name: string | null
  editor_content: unknown
  createdAt: Date
}
export interface PageRows<T> {
  rows: T[]
  page: number
  pages: number
  total: number
}
const context: { knex: Knex; req: undefined } = { knex: db, req: undefined }
export function beers(
  where: BeerFilter = {},
): Knex.QueryBuilder<BeerRow, BeerRow[]> {
  return queryBeers(context, where).where('item.beer_id', '>', 0)
}
export function companies(
  where: CompanyFilter = {},
): Knex.QueryBuilder<CompanyRow, CompanyRow[]> {
  return queryCompanies(context, where).where('item.place_id', '>', 0)
}
export function users(
  where: UserFilter = {},
): Knex.QueryBuilder<UserRow, UserRow[]> {
  return queryUsers(context, where).where('item.user_id', '>', 0)
}
export function topics(): Knex.QueryBuilder<TopicRow, TopicRow[]> {
  return db<TopicRow>('Topic as item')
    .select(
      'item.id',
      'item.topic_id',
      'item.name',
      'item.url_name',
      'item.description',
      'item.editor_content',
      'item.created_at',
      'item.published',
    )
    .where('item.published', 1)
    .where('item.topic_id', '>', 0)
}
export function comments(): Knex.QueryBuilder<CommentRow, CommentRow[]> {
  // is_checked в старом проекте не ограничивал публичную выдачу.
  return db<CommentRow>('Comment as item')
    .select(
      'item.id',
      'item.comment_id',
      'item.object_id',
      'item.type_id',
      'item.name',
      'item.editor_content',
      'item.createdAt',
    )
    .where('item.comment_id', '>', 0)
    .where((q) =>
      q
        .whereNotIn('item.type_id', [1, 5, 6])
        .orWhereNull('item.object_id')
        .orWhereNotIn(
          'item.object_id',
          db('Topic')
            .select('topic_id')
            .where('published', 0)
            .whereNotNull('topic_id'),
        ),
    )
}
export function requirePage(params: URLSearchParams, key = 'page'): number {
  const text = params.get(key) ?? '1'
  const value = Number(text)
  if (
    !/^\d+$/.test(text) ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > 100000
  ) {
    throw data('Неверный номер страницы', { status: 400 })
  }
  return value
}
export async function rowsPage<T extends object>(
  query: Knex.QueryBuilder<T, T[]>,
  params: URLSearchParams,
  key = 'page',
  size = 20,
): Promise<PageRows<T>> {
  const page = requirePage(params, key)
  const count = await query
    .clone()
    .clearSelect()
    .clearOrder()
    .count<{ total: string | number }>({ total: 'item.id' })
    .first()
  const total = Number(count?.total ?? 0),
    pages = Math.max(1, Math.ceil(total / size))
  if (page > pages) {
    throw data('Страница выдачи не найдена', { status: 404 })
  }
  const rows = await query
    .orderBy('item.id', 'asc')
    .limit(size)
    .offset((page - 1) * size)
  return { rows: rows as T[], page, pages, total }
}
export function beerLink(row: BeerRow): PublicLink {
  return {
    name: row.name || 'Пиво без названия',
    path: objectPath('beer', row.beer_id, row.url_name),
    description: row.description ? plainText(row.description) : undefined,
    image: imageUrl(row.image),
  }
}
export function companyLink(row: CompanyRow): PublicLink {
  return {
    name: row.name || 'Заведение без названия',
    path: objectPath('place', row.place_id, row.url_name),
    description: row.address || undefined,
    mapPath:
      row.lat !== null && row.lng !== null
        ? `/map/?place_id=${row.place_id}&position=${Number(row.lat)},${Number(row.lng)},16`
        : undefined,
  }
}
export function userLink(row: UserRow): PublicLink {
  return {
    name: row.fullname || row.username || 'Участник',
    path: profilePath(row.user_id),
  }
}
export function articleLink(row: TopicRow): PublicLink {
  return {
    name: row.name,
    path: topicPath(row.topic_id, row.url_name),
    description: row.description ? plainText(row.description) : undefined,
    date: new Date(row.created_at).toISOString().slice(0, 10),
  }
}
export function discussionLink(row: CommentRow): PublicLink {
  return {
    name: row.name || `Комментарий № ${row.comment_id}`,
    path: commentPath(row.comment_id),
    date: new Date(row.createdAt).toISOString().slice(0, 10),
    description: plainText(commentHtml(row)).slice(0, 240),
  }
}
export async function authorLink(
  table: '_UserTopics' | '_UserComments',
  id: string,
): Promise<PublicLink[]> {
  const rows = await users().whereIn(
    'item.id',
    db(table).select('B').where('A', id),
  )
  return rows.map(userLink)
}
export async function commentObject(row: CommentRow): Promise<PublicLink[]> {
  if (!row.object_id) {
    return []
  }
  if (row.type_id === 3) {
    const item = await companies({ place_id: row.object_id }).first()
    return item ? [companyLink(item)] : []
  }
  if (row.type_id === 4) {
    const item = await beers({ beer_id: row.object_id }).first()
    return item ? [beerLink(item)] : []
  }
  if ([1, 5, 6].includes(row.type_id)) {
    const item = await topics().where('item.topic_id', row.object_id).first()
    return item ? [articleLink(item)] : []
  }
  return []
}
export async function commentSection(
  id: number,
  types: number[],
  params: URLSearchParams,
): Promise<PublicSection> {
  const page = await rowsPage(
    comments().where('item.object_id', id).whereIn('item.type_id', types),
    params,
    'comments_page',
  )
  return {
    id: 'comments',
    title: 'Комментарии',
    items: await Promise.all(
      page.rows.map(async (row) => ({
        ...discussionLink(row),
        authors: await authorLink('_UserComments', row.id),
      })),
    ),
    page: page.page,
    pages: page.pages,
    parameter: 'comments_page',
  }
}
export async function companyExtras(
  id: string,
  numericId: number,
  params: URLSearchParams,
): Promise<PublicSection[]> {
  const owners = await users().whereIn(
    'item.id',
    db('_UserOwnedPlaces').select('B').where('A', id),
  )
  return [
    { id: 'owners', title: 'Владелец', items: owners.map(userLink) },
    await commentSection(numericId, [3], params),
  ]
}
export function commentHtml(row: CommentRow): string {
  return renderContent(row.editor_content, '', commentPath(row.comment_id))
}

/** Старые City.city_id и Place.city_id относятся к разным справочникам.
 * Городские страницы старого сайта сортировали заведения по координатам.
 * Ограничиваем окрестность радиусом 50 км, чтобы не подмешивать другие регионы.
 */
export function nearCity<T extends object>(
  query: Knex.QueryBuilder<T, T[]>,
  city: CityRow,
): Knex.QueryBuilder<T, T[]> {
  const distance =
    '6371 * 2 * ASIN(SQRT(LEAST(1, POWER(SIN(RADIANS(item.lat - ?) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(item.lat)) * POWER(SIN(RADIANS(item.lng - ?) / 2), 2))))'
  const center = [Number(city.lat), Number(city.lat), Number(city.lng)]
  return query
    .whereNotNull('item.lat')
    .whereNotNull('item.lng')
    .whereRaw(`${distance} <= ?`, [...center, 50])
    .orderByRaw(`${distance} ASC`, center)
}
