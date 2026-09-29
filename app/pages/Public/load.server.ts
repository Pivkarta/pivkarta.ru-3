import profileAliases from '../../../server/public/profile-aliases.json'
import { data, redirect, type LoaderFunctionArgs } from 'react-router'
import { knexClient as db } from '../../../server/knex'
import {
  articleLink,
  authorLink,
  beerLink,
  beers,
  commentHtml,
  commentObject,
  comments,
  commentSection,
  companies,
  companyLink,
  discussionLink,
  nearCity,
  rowsPage,
  topics,
  userLink,
  users,
  type CityRow,
} from '../../../server/public/data'
import {
  galleryImages,
  imageUrl,
  renderContent,
} from '../../../server/public/content'
import type { PublicPageData } from './types'
import { commentPath, pageLink, profilePath, topicPath } from './paths'
import { isCompanyCanonicalPath } from '../Companies/Company/routePath'

function missing(): never {
  throw data('Страница не найдена', { status: 404 })
}
function integer(value: string): number {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 2147483647) {
    return missing()
  }
  return Number(value)
}
function canonical(url: URL, path: string): void {
  if (!isCompanyCanonicalPath(url.pathname, path)) {
    throw redirect(`${path}${url.search}`, 301)
  }
}
function blank(title: string, path: string, url: URL): PublicPageData {
  return {
    title,
    path,
    description: '',
    items: [],
    sections: [],
    page: 1,
    pages: 1,
    query: url.search,
  }
}
function mapPosition(value: string): {
  lat: number
  lng: number
  zoom: number
} {
  const parts = /^@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/.exec(
    value,
  )
  if (!parts) {
    throw data('Неверные координаты карты', { status: 400 })
  }
  const [lat, lng, zoom] = parts.slice(1).map(Number)
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || zoom < 0 || zoom > 22) {
    throw data('Неверные координаты карты', { status: 400 })
  }
  return { lat, lng, zoom }
}

async function resolvePage({
  request,
}: LoaderFunctionArgs): Promise<PublicPageData> {
  const url = new URL(request.url)
  url.searchParams.delete('_routes')
  const path = url.pathname.replace(/\/_.data$/, '/').replace(/\.data$/, '')
  let parts: string[]
  try {
    parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return missing()
  }
  let city: CityRow | undefined
  let coordinates: PublicPageData['map']
  if (
    parts.at(-1)?.startsWith('@') &&
    !['profile', 'beer', 'topics'].includes(parts[0])
  ) {
    coordinates = mapPosition(parts.pop() || '')
  }
  // Город проверяется по базе; произвольный неизвестный путь остаётся 404.
  if (parts[0] === 'city' && parts.length === 2) {
    city = await db<CityRow>('City').where('alias', parts[1]).first()
    if (!city) {
      return missing()
    }
    parts = ['map']
  } else if (
    parts.length &&
    ![
      'beer',
      'sort',
      'place',
      'companies',
      'blog',
      'topics',
      'profile',
      'comments',
      'city',
      'map',
      'contacts.html',
      'places',
    ].includes(parts[0])
  ) {
    city = await db<CityRow>('City').where('alias', parts[0]).first()
    if (!city) {
      return missing()
    }
    parts.shift()
    if (!parts.length) {
      parts = ['map']
    }
  }
  if (!city && url.searchParams.has('city')) {
    city = await db<CityRow>('City')
      .where('alias', url.searchParams.get('city'))
      .first()
    if (!city) {
      return missing()
    }
  }
  const key = parts.join('/')
  if (['places/create', 'beer/create', 'topics/create'].includes(key)) {
    const title =
      key === 'places/create'
        ? 'Добавление заведения'
        : key === 'beer/create'
          ? 'Добавление пива'
          : 'Создание публикации'
    const result = blank(title, `/${key}/`, url)
    result.noindex = true
    result.html =
      '<p>Для добавления или уточнения сведений напишите <a href="mailto:sales@pivkarta.ru">sales@pivkarta.ru</a>. Укажите название и ссылку на существующую карточку, если она есть.</p>'
    canonical(url, result.path)
    return result
  }
  if (key === 'contacts.html') {
    const result = blank('Контакты', '/contacts.html', url)
    result.html =
      '<p>По всем вопросам пишите на почту: <a href="mailto:sales@pivkarta.ru">sales@pivkarta.ru</a>.</p><p>Пожелания, предложения и уточнения сведений о заведениях можно направлять по этому адресу.</p><h2>О сайте</h2><p>«Пивная карта» — информационный каталог пива и тематических заведений. Сайт не пропагандирует употребление алкоголя. Реклама алкогольной продукции запрещена.</p>'
    canonical(url, result.path)
    return result
  }
  if (key === 'city') {
    const result = blank('Все города', '/city/', url)
    const cities = await db<CityRow>('City')
      .select('name', 'alias')
      .orderBy('name')
    result.items = cities.map((row) => ({
      name: row.name,
      path: `/${encodeURIComponent(row.alias)}/`,
    }))
    canonical(url, result.path)
    return result
  }
  if (key === 'beer/showlist' || key === 'sort/showlist') {
    const result = blank('Каталог пива', '/beer/showlist/', url)
    if (city) {
      url.searchParams.set('city', city.alias)
      result.city = city
    }
    const query = beers()
    const name = url.searchParams.get('name')
    if (name) {
      query.whereRaw("?? LIKE ? ESCAPE '!'", [
        'item.name',
        `%${name.replace(/[!%_]/g, '!$&')}%`,
      ])
    }
    for (const field of ['color', 'container', 'filtered', 'pasteurized']) {
      const value = url.searchParams.get(field)
      if (value !== null && value !== '') {
        if (['filtered', 'pasteurized'].includes(field)) {
          if (!['true', 'false'].includes(value)) {
            throw data('Неверный фильтр пива', { status: 400 })
          }
          query.where(`item.${field}`, value === 'true')
        } else if (field === 'container') {
          query.where('item.container', integer(value))
        } else {
          query.where('item.color', value)
        }
      }
    }
    // Город влияет на связанные заведения, карточки сортов остаются общими.
    if (city) {
      query.whereIn(
        'item.id',
        db('_PlaceBeerBeer')
          .select('A')
          .whereIn(
            'B',
            db('_PlaceBeerPlace')
              .select('B')
              .whereIn(
                'A',
                nearCity(companies(), city)
                  .clearSelect()
                  .clearOrder()
                  .select('item.id'),
              ),
          ),
      )
    }
    const page = await rowsPage(query, url.searchParams, 'page', 12)
    Object.assign(result, {
      items: page.rows.map(beerLink),
      page: page.page,
      pages: page.pages,
      search: true,
      query: url.search,
    })
    canonical(url, result.path)
    return result
  }
  if (
    (parts[0] === 'beer' && parts.length >= 2) ||
    (parts[0] === 'sort' &&
      parts[1] === 'show' &&
      [3, 4].includes(parts.length))
  ) {
    const id = integer(parts[0] === 'beer' ? parts[1] : parts[2])
    const beer = await beers({ beer_id: id }).first()
    if (!beer) {
      return missing()
    }
    if (
      parts[0] === 'beer' &&
      parts.length > 3 &&
      parts.slice(2).join('/') !== beer.url_name
    ) {
      return missing()
    }
    const link = beerLink(beer)
    const result = blank(link.name, link.path, url)
    canonical(url, result.path)
    result.html = renderContent(
      beer.editor_content,
      beer.description || '',
      result.path,
    )
    result.image = imageUrl(beer.image)
    result.gallery = galleryImages(beer.gallery)
    const related = await rowsPage(
      companies({ beerId: beer.id }),
      url.searchParams,
    )
    result.sections = [
      {
        id: 'places',
        title: 'Связанные заведения',
        items: related.rows.map(companyLink),
        page: related.page,
        pages: related.pages,
      },
      await commentSection(id, [4], url.searchParams),
    ]
    result.items = [
      { name: 'Заведения на карте', path: `/map/?beer_id=${id}` },
      { name: 'Каталог пива', path: '/beer/showlist/' },
    ]
    return result
  }
  if (
    parts[0] === 'place' &&
    parts[1] === 'show' &&
    [3, 4].includes(parts.length)
  ) {
    const company = await companies({ place_id: integer(parts[2]) }).first()
    if (!company) {
      return missing()
    }
    throw redirect(`${companyLink(company).path}${url.search}`, 301)
  }
  if (parts[0] === 'place' && parts.length >= 2 && /^\d+$/.test(parts[1])) {
    const company = await companies({ place_id: integer(parts[1]) }).first()
    if (!company) {
      return missing()
    }
    if (parts.length > 3 && parts.slice(2).join('/') !== company.url_name) {
      return missing()
    }
    throw redirect(`${companyLink(company).path}${url.search}`, 301)
  }
  if (
    key === 'companies' ||
    key === 'place/showlist' ||
    key === 'map' ||
    (parts[0] === 'place' &&
      parts[1] === 'index' &&
      parts[2] === 'type' &&
      parts.length === 4)
  ) {
    const kind = parts[3] ?? url.searchParams.get('type')
    if (kind && !['bar', 'shop', 'brewery'].includes(kind)) {
      return missing()
    }
    const isMap = key === 'map' || Boolean(coordinates)
    const target = isMap
      ? '/map/'
      : kind
        ? `/place/index/type/${kind}/`
        : '/companies'
    if (city) {
      url.searchParams.set('city', city.alias)
    }
    if (kind && isMap) {
      url.searchParams.set('type', kind)
    } else {
      url.searchParams.delete('type')
    }
    if (coordinates) {
      url.searchParams.set(
        'position',
        `${coordinates.lat},${coordinates.lng},${coordinates.zoom}`,
      )
    }
    const labels: Record<string, string> = {
      bar: 'Бары',
      shop: 'Магазины',
      brewery: 'Пивоварни',
    }
    const title = `${isMap ? 'Карта заведений' : kind ? labels[kind] : 'Заведения'}${city ? ` — ${city.name}` : ''}`
    const result = blank(title, target, url)
    result.city = city
    const query = companies()
    const position = url.searchParams.get('position')
    if (isMap && position) {
      const viewport = mapPosition(`@${position}`)
      const delta = 180 / 2 ** Math.min(viewport.zoom, 19)
      query
        .whereBetween('item.lat', [viewport.lat - delta, viewport.lat + delta])
        .whereBetween('item.lng', [viewport.lng - delta, viewport.lng + delta])
    }
    const selectedPlace = url.searchParams.get('place_id')
    if (isMap && selectedPlace) {
      const selected = await companies({
        place_id: integer(selectedPlace),
      }).first()
      if (!selected) {
        return missing()
      }
      result.sections.push({
        id: 'selected-place',
        title: 'Выбранное заведение',
        items: [companyLink(selected)],
      })
      if (selected.lat !== null && selected.lng !== null) {
        coordinates = {
          lat: Number(selected.lat),
          lng: Number(selected.lng),
          zoom: 16,
          marker: true,
        }
      }
    }
    if (city) {
      nearCity(query, city)
      result.description = `${title}. Заведения в пределах 50 км от центра города.`
    }
    if (kind) {
      query.where(`item.is_${kind}`, 1)
    }
    const name = url.searchParams.get('name') || url.searchParams.get('search')
    if (name) {
      query.whereRaw("?? LIKE ? ESCAPE '!'", [
        'item.name',
        `%${name.replace(/[!%_]/g, '!$&')}%`,
      ])
    }
    const beerId = url.searchParams.get('beer_id')
    const beerName = url.searchParams.get('beer')
    if (beerId || beerName) {
      const matching = beers(
        beerId ? { beer_id: integer(beerId) } : { name: beerName || '' },
      )
        .clearSelect()
        .select('item.id')
      query.whereIn(
        'item.id',
        db('_PlaceBeerPlace')
          .select('A')
          .whereIn(
            'B',
            db('_PlaceBeerBeer').select('B').whereIn('A', matching),
          ),
      )
      if (beerId) {
        const beer = await beers({ beer_id: integer(beerId) }).first()
        if (!beer) {
          return missing()
        }
        result.sections.push({
          id: 'selected-beer',
          title: 'Выбранное пиво',
          items: [beerLink(beer)],
        })
      }
    }
    const page = await rowsPage(query, url.searchParams, 'page', 12)
    Object.assign(result, {
      items: page.rows.map(companyLink),
      page: page.page,
      pages: page.pages,
      search: true,
      query: url.search,
    })
    result.sections.push({
      id: 'catalogs',
      title: 'Разделы каталога',
      items: [
        {
          name: 'Бары',
          path: `/place/index/type/bar/${city ? `?city=${encodeURIComponent(city.alias)}` : ''}`,
        },
        {
          name: 'Магазины',
          path: `/place/index/type/shop/${city ? `?city=${encodeURIComponent(city.alias)}` : ''}`,
        },
        {
          name: 'Пивоварни',
          path: `/place/index/type/brewery/${city ? `?city=${encodeURIComponent(city.alias)}` : ''}`,
        },
      ],
    })
    if (isMap) {
      result.map =
        coordinates ||
        (url.searchParams.get('position')
          ? mapPosition(`@${url.searchParams.get('position')}`)
          : city
            ? { lat: Number(city.lat), lng: Number(city.lng), zoom: 12 }
            : { lat: 0, lng: 0, zoom: 2 })
    }
    canonical(url, result.path)
    return result
  }
  if (key === 'blog/showlist' || key === 'topics') {
    const result = blank('Публикации', '/blog/showlist/', url)
    const page = await rowsPage(topics(), url.searchParams, 'page', 10)
    Object.assign(result, {
      items: page.rows.map(articleLink),
      page: page.page,
      pages: page.pages,
    })
    canonical(url, result.path)
    return result
  }
  if (
    (parts[0] === 'topics' && parts.length === 2) ||
    (parts[0] === 'blog' && parts[1] === 'show' && parts.length === 3)
  ) {
    const query = topics()
    if (parts[0] === 'topics') {
      query.where('item.url_name', parts[1])
    } else {
      query.where('item.topic_id', integer(parts[2]))
    }
    const topic = await query.first()
    if (!topic) {
      return missing()
    }
    const result = blank(
      topic.name,
      topicPath(topic.topic_id, topic.url_name),
      url,
    )
    canonical(url, result.path)
    result.html = renderContent(
      topic.editor_content,
      topic.description || '',
      result.path,
    )
    result.description = `${topic.name}. Публикация от ${new Date(topic.created_at).toISOString().slice(0, 10)}.`
    result.sections = [
      {
        id: 'author',
        title: 'Автор',
        items: await authorLink('_UserTopics', topic.id),
      },
      await commentSection(topic.topic_id, [1, 5, 6], url.searchParams),
    ]
    return result
  }
  if (key === 'profile/showlist') {
    const result = blank('Участники', '/profile/showlist/', url)
    const page = await rowsPage(users(), url.searchParams, 'page', 10)
    Object.assign(result, {
      items: page.rows.map(userLink),
      page: page.page,
      pages: page.pages,
    })
    canonical(url, result.path)
    return result
  }
  if (parts[0] === 'profile' && parts.length >= 2) {
    const aliases: Record<string, number> = profileAliases
    const numeric = /^\/profile\/show\/(\d+)\/?$/.exec(path)
    const username = decodeURIComponent(
      path.slice('/profile/'.length).replace(/\/$/, ''),
    )
    const alias = username.toLowerCase()
    const selector = numeric
      ? { user_id: integer(numeric[1]) }
      : Object.hasOwn(aliases, alias)
        ? { user_id: aliases[alias] }
        : { username }
    const user = await users(selector).first()
    if (!user) {
      return missing()
    }
    const result = blank(
      user.fullname || user.username || 'Участник',
      profilePath(user.user_id),
      url,
    )
    canonical(url, result.path)
    result.html = renderContent(user.about)
    result.image = imageUrl(user.image || user.photo)
    const owned = await rowsPage(
      companies({ ownerId: user.id }),
      url.searchParams,
    )
    const written = await rowsPage(
      topics().whereIn(
        'item.id',
        db('_UserTopics').select('A').where('B', user.id),
      ),
      url.searchParams,
      'topics_page',
    )
    const discussed = await rowsPage(
      comments().whereIn(
        'item.id',
        db('_UserComments').select('A').where('B', user.id),
      ),
      url.searchParams,
      'comments_page',
    )
    result.sections = [
      {
        id: 'companies',
        title: 'Заведения участника',
        items: owned.rows.map(companyLink),
        page: owned.page,
        pages: owned.pages,
      },
      {
        id: 'topics',
        title: 'Публикации',
        items: written.rows.map(articleLink),
        page: written.page,
        pages: written.pages,
        parameter: 'topics_page',
      },
      {
        id: 'comments',
        title: 'Комментарии',
        items: discussed.rows.map(discussionLink),
        page: discussed.page,
        pages: discussed.pages,
        parameter: 'comments_page',
      },
    ]
    return result
  }
  if (key === 'comments') {
    const result = blank('Комментарии', '/comments/', url)
    const page = await rowsPage(comments(), url.searchParams, 'page', 12)
    Object.assign(result, {
      items: page.rows.map(discussionLink),
      page: page.page,
      pages: page.pages,
    })
    canonical(url, result.path)
    return result
  }
  const commentMatch = /^comments\/comment-(\d+)\.html$/.exec(key)
  if (commentMatch) {
    const comment = await comments()
      .where('item.comment_id', integer(commentMatch[1]))
      .first()
    if (!comment) {
      return missing()
    }
    const result = blank(
      comment.name || `Комментарий № ${comment.comment_id}`,
      commentPath(comment.comment_id),
      url,
    )
    canonical(url, result.path)
    result.html = commentHtml(comment)
    result.description = `Комментарий от ${new Date(comment.createdAt).toISOString().slice(0, 10)}.`
    result.sections = [
      {
        id: 'author',
        title: 'Автор',
        items: await authorLink('_UserComments', comment.id),
      },
      {
        id: 'object',
        title: 'Обсуждаемый материал',
        items: await commentObject(comment),
      },
    ]
    return result
  }
  return missing()
}
export async function loadPublic(
  args: LoaderFunctionArgs,
): Promise<PublicPageData> {
  try {
    const result = await resolvePage(args)
    const params = new URLSearchParams(result.query)
    // Содержательные параметры входят в canonical; служебные и рекламные — нет.
    for (const key of [...params.keys()]) {
      if (
        ![
          'page',
          'name',
          'color',
          'container',
          'filtered',
          'pasteurized',
          'city',
          'type',
          'beer_id',
          'place_id',
          'beer',
          'search',
          'comments_page',
          'topics_page',
        ].includes(key)
      ) {
        params.delete(key)
      }
    }
    for (const key of ['page', 'comments_page', 'topics_page']) {
      if (params.get(key) === '1') {
        params.delete(key)
      }
    }
    params.sort()
    result.canonical = pageLink(
      result.path,
      params.toString(),
      Number(params.get('page') || 1),
    )
    return result
  } catch (error) {
    if (
      error instanceof Response ||
      (error && typeof error === 'object' && 'type' in error)
    ) {
      throw error
    }
    console.error(
      'Ошибка чтения публичной страницы',
      error instanceof Error ? error.name : 'Неизвестная ошибка',
    )
    throw data('Не удалось загрузить страницу. Повторите попытку позже.', {
      status: 503,
    })
  }
}
