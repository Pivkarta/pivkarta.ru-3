import test from 'node:test'
import assert from 'node:assert/strict'
import { loader as robots } from '../app/routes/robots[.]txt.ts'

// Индекс не обращается к БД; адрес нужен только для создания клиента Knex.
process.env.MYSQL_URL = 'mysql://test:test@127.0.0.1:1/test'
const { loader: sitemap } = await import('../app/routes/sitemap[.]xml.ts')

for (const origin of [
  'http://pivkarta.localhost:3000',
  'http://pivkarta.localhost:8080',
  'https://pivkarta.ru',
]) {
  test(`Sitemap и robots сохраняют адрес запроса: ${origin}`, async () => {
    const args = {
      request: new Request(`${origin}/sitemap.xml`),
      params: {},
      context: {},
    }
    const response = await sitemap(args)
    assert.equal(response.status, 200)
    const xml = await response.text()
    const links = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    )
    assert.equal(links.length, 6)
    for (const link of links) assert.equal(new URL(link).origin, origin)
    assert.ok(
      (await robots(args).text()).includes(`Sitemap: ${origin}/sitemap.xml`),
    )
  })
}

const { knexClient: db } = await import('../server/knex/index.ts')

for (const section of ['beers', 'places', 'topics', 'users', 'comments']) {
  test(`Индекс ${section} ведёт на пачки URL, включая page=1`, async (t) => {
    const offsets = []
    // Подменяем только выполнение SQL: построение запросов и loader настоящие.
    t.mock.method(db.client, 'runner', (query) => ({
      run: async () => {
        if (query.toSQL().sql.includes('count(')) return { total: 1001 }
        offsets.push(query._single.offset)
        return [
          {
            beer_id: 1,
            place_id: 1,
            topic_id: 1,
            user_id: 1,
            comment_id: 1,
            url_name: 'test',
          },
        ]
      },
    }))
    const origin = 'http://pivkarta.localhost:3000'
    const indexUrl = `${origin}/sitemap.xml?section=${section}`
    const load = (url) =>
      sitemap({ request: new Request(url), params: {}, context: {} })
    const index = await (await load(indexUrl)).text()
    assert.match(index, /<sitemapindex /)
    const links = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
      match[1].replaceAll('&#38;', '&'),
    )
    assert.deepEqual(
      links,
      [1, 2].map((page) => `${indexUrl}&page=${page}`),
    )
    for (const link of links) {
      assert.notEqual(link, indexUrl)
      const response = await load(link)
      assert.equal(response.status, 200)
      const body = await response.text()
      assert.match(body, /<urlset /)
      assert.doesNotMatch(body, /<sitemapindex/)
      assert.match(body, /<url><loc>/)
    }
    assert.deepEqual(offsets, [0, 1000])
  })
}
