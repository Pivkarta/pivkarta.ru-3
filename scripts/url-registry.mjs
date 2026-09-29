import { readFile, writeFile } from 'node:fs/promises'
const directory = 'projects/tasks/003--url-structure/'
const database = JSON.parse(
  await readFile(`${directory}database-inventory.json`, 'utf8'),
)
const sitemap = JSON.parse(
  await readFile(`${directory}old-sitemap.json`, 'utf8'),
)
const enc = encodeURIComponent
const paths = {
  Beer: (row) =>
    `/beer/${row.beer_id}/${row.url_name ? `${enc(row.url_name)}/` : ''}`,
  Place: (row) =>
    `/place/${row.place_id}/${row.url_name ? `${enc(row.url_name)}/` : ''}`,
  Topic: (row) =>
    row.url_name
      ? `/topics/${enc(row.url_name)}/`
      : `/blog/show/${row.topic_id}/`,
  User: (row) => `/profile/show/${row.user_id}/`,
  Comment: (row) => `/comments/comment-${row.comment_id}.html`,
  City: (row) => `/map/?city=${enc(row.alias)}`,
}
const byId = Object.fromEntries(
  Object.entries(database).map(([kind, rows]) => [
    kind,
    new Map(
      rows.map((row) => [
        String(
          row[
            `${kind === 'Place' ? 'place' : kind === 'User' ? 'user' : kind.toLowerCase()}_id`
          ],
        ),
        row,
      ]),
    ),
  ]),
)
const username = new Map(
  database.User.filter((row) => row.username).map((row) => [row.username, row]),
)
const topicSlug = new Map(
  database.Topic.filter((row) => row.url_name).map((row) => [
    row.url_name,
    row,
  ]),
)
const unpublishedTopics = new Set(
  database.Topic.filter((row) => !row.published).map((row) => row.topic_id),
)
const privateComments = new Set(
  database.Comment.filter(
    (row) =>
      [1, 5, 6].includes(row.type_id) && unpublishedTopics.has(row.object_id),
  ).map((row) => `/comments/comment-${row.comment_id}.html`),
)
const records = new Map()
function add(source, target, entity, reason) {
  if (privateComments.has(source)) {
    target = null
    reason = 'Комментарий относится к неопубликованной статье'
  }
  if (!source) return
  records.set(source, {
    source,
    target,
    status: target ? (source === target ? 200 : 301) : 404,
    entity,
    ...(reason ? { reason } : {}),
  })
}
for (const [kind, rows] of Object.entries(database))
  for (const row of rows) {
    const numeric =
      row[
        `${kind === 'Place' ? 'place' : kind === 'User' ? 'user' : kind.toLowerCase()}_id`
      ]
    if (!numeric || (kind === 'Topic' && !row.published)) continue
    const target = paths[kind](row),
      entity = `${kind}:${numeric}`
    add(target, target, entity)
    if (kind === 'Beer') {
      add(`/beer/${numeric}`, target, entity)
      add(`/sort/show/${numeric}`, target, entity)
    }
    if (kind === 'Place') {
      add(`/place/${numeric}`, target, entity)
      add(`/place/show/${numeric}`, target, entity)
    }
    if (kind === 'Topic') add(`/blog/show/${numeric}/`, target, entity)
    if (kind === 'User' && row.username)
      add(`/profile/${enc(row.username)}/`, target, entity)
    if (kind === 'City') add(`/${row.alias}/`, target, entity)
  }
for (const raw of sitemap.urls) {
  const url = new URL(raw)
  const source = url.pathname + url.search
  if (records.has(source)) continue
  let match, row, kind
  if ((match = /^\/beer\/(\d+)(?:\/|$)/.exec(source))) {
    kind = 'Beer'
    row = byId.Beer.get(match[1])
  } else if ((match = /^\/place\/(\d+)(?:\/|$)/.exec(source))) {
    kind = 'Place'
    row = byId.Place.get(match[1])
  } else if ((match = /^\/blog\/show\/(\d+)/.exec(source))) {
    kind = 'Topic'
    row = byId.Topic.get(match[1])
  } else if ((match = /^\/topics\/(.*?)\/?$/.exec(source))) {
    kind = 'Topic'
    row = topicSlug.get(decodeURIComponent(match[1]))
  } else if ((match = /^\/profile\/(.*?)\/?$/.exec(source))) {
    kind = 'User'
    row = username.get(decodeURIComponent(match[1]))
  } else if ((match = /^\/comments\/comment-(\d+)\.html/.exec(source))) {
    kind = 'Comment'
    row = byId.Comment.get(match[1])
  }
  if (row && !(kind === 'Topic' && !row.published))
    add(source, paths[kind](row), kind)
  else if (
    [
      '/',
      '/contacts.html',
      '/beer/showlist/',
      '/blog/showlist/',
      '/profile/showlist/',
      '/comments/',
      '/city/',
    ].includes(source)
  )
    add(source, source, 'раздел')
  else if (source === '/place/showlist/') add(source, '/companies', 'раздел')
  else
    add(
      source,
      null,
      kind || 'неизвестно',
      'Статья не опубликована либо публичная запись отсутствует в базе',
    )
}
await writeFile(
  `${directory}url-registry.json`,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      sitemapErrors: sitemap.pages.filter((page) => page.status),
      records: [...records.values()],
    },
    null,
    2,
  ) + '\n',
)
console.log(
  'Реестр:',
  records.size,
  'адресов. Исключения:',
  [...records.values()].filter((row) => row.status === 404).length,
)
