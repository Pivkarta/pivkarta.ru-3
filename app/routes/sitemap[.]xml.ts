import { data, type LoaderFunctionArgs } from 'react-router'
import type { Knex } from 'knex'
import { knexClient as db } from '../../server/knex'
import {
  beers,
  companies,
  users,
  topics,
  comments,
  requirePage,
  type CityRow,
} from '../../server/public/data'
import {
  objectPath,
  topicPath,
  profilePath,
  commentPath,
} from '../pages/Public/paths'
import { canonicalUrl } from '../components/seo/site'

function xml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`)
}
function response(
  type: 'sitemapindex' | 'urlset',
  paths: string[],
  origin: string,
): Response {
  const tag = type === 'sitemapindex' ? 'sitemap' : 'url'
  // В индексе page=1 обозначает отдельный XML с первой пачкой URL.
  const links = paths.map((path): string =>
    type === 'sitemapindex'
      ? new URL(path, origin).href
      : canonicalUrl(path, origin),
  )
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<${type} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${links.map((link) => `<${tag}><loc>${xml(link)}</loc></${tag}>`).join('')}</${type}>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  )
}
interface SitemapRow {
  id: string
  beer_id: number | null
  place_id: number | null
  topic_id: number | null
  user_id: number | null
  comment_id: number | null
  url_name: string | null
}
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<Response> => {
  const url = new URL(request.url),
    section = url.searchParams.get('section')
  const sections = ['main', 'beers', 'places', 'topics', 'users', 'comments']
  if (!section) {
    return response(
      'sitemapindex',
      sections.map((name) => `/sitemap.xml?section=${name}`),
      url.origin,
    )
  }
  if (!sections.includes(section)) {
    throw data('Раздел sitemap не найден', { status: 404 })
  }
  if (section === 'main') {
    const cities = await db<CityRow>('City').select('alias')
    return response(
      'urlset',
      [
        '/',
        '/companies',
        '/beer/showlist/',
        '/blog/showlist/',
        '/profile/showlist/',
        '/comments/',
        '/city/',
        '/map/',
        '/contacts.html',
        ...['bar', 'shop', 'brewery'].map(
          (type) => `/place/index/type/${type}/`,
        ),
        ...cities.map((city) => `/map/?city=${encodeURIComponent(city.alias)}`),
      ],
      url.origin,
    )
  }
  const query = { beers, places: companies, topics, users, comments }[
    section as 'beers' | 'places' | 'topics' | 'users' | 'comments'
  ]() as unknown as Knex.QueryBuilder<SitemapRow, SitemapRow[]>
  const counter = await query
    .clone()
    .clearSelect()
    .count<{ total: string | number }>({ total: 'item.id' })
    .first()
  const pages = Math.max(1, Math.ceil(Number(counter?.total || 0) / 1000))
  if (!url.searchParams.has('page')) {
    return response(
      'sitemapindex',
      Array.from(
        { length: pages },
        (_, index) => `/sitemap.xml?section=${section}&page=${index + 1}`,
      ),
      url.origin,
    )
  }
  const page = requirePage(url.searchParams)
  if (page > pages) {
    throw data('Страница sitemap не найдена', { status: 404 })
  }
  const rows = await query
    .orderBy('item.id')
    .limit(1000)
    .offset((page - 1) * 1000)
  return response(
    'urlset',
    rows.map((row) =>
      section === 'beers'
        ? objectPath('beer', row.beer_id, row.url_name)
        : section === 'places'
          ? objectPath('place', row.place_id, row.url_name)
          : section === 'topics'
            ? topicPath(row.topic_id, row.url_name)
            : section === 'users'
              ? profilePath(row.user_id)
              : commentPath(row.comment_id),
    ),
    url.origin,
  )
}
