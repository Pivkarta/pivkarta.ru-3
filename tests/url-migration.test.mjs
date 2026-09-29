import test from 'node:test'
import assert from 'node:assert/strict'
import { renderContent, contentUrl } from '../server/public/content.ts'
import { objectPath, pageLink } from '../app/pages/Public/paths.ts'
import { canonicalUrl } from '../app/components/seo/site.ts'
const origin = process.env.URL_TEST_ORIGIN || 'http://localhost:3000'

async function get(path) {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual' })
  return {
    status: response.status,
    location: response.headers.get('location'),
    html: await response.text(),
  }
}
async function resolve(path) {
  const first = await get(path)
  if (first.status === 301) {
    assert.ok(first.location.startsWith('/'), path)
    const target = await get(first.location)
    assert.equal(target.status, 200, `${path} → ${first.location}`)
    return { first, ...target, path: first.location }
  }
  assert.equal(first.status, 200, path)
  return { first, ...first, path }
}
function canonical(html) {
  return html
    .match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    .replaceAll('&amp;', '&')
}

test('Сложные слаги и параметры не теряют идентичность', () => {
  assert.equal(
    objectPath('beer', 1740, 'tropic-banana-&-passion-fruit-smoothie'),
    '/beer/1740/tropic-banana-%26-passion-fruit-smoothie/',
  )
  assert.equal(
    pageLink('/companies', 'city=moskva&type=bar', 2),
    '/companies?city=moskva&type=bar&page=2',
  )
  assert.ok(
    canonicalUrl('/beer/715/tomskoe-barhatnoe/?page=2#places').endsWith(
      '/beer/715/tomskoe-barhatnoe/?page=2',
    ),
  )
})
test('Контент сохраняет ссылки и изображения без исполняемого HTML', () => {
  const html = renderContent({
    blocks: [
      {
        text: 'Сорт',
        type: 'unstyled',
        entityRanges: [{ key: 0, offset: 0, length: 4 }],
      },
    ],
    entityMap: {
      0: {
        type: 'LINK',
        data: { url: 'https://pivkarta.ru/beer/715/tomskoe-barhatnoe/' },
      },
    },
  })
  assert.match(html, /href="\/beer\/715\/tomskoe-barhatnoe\/"/)
  const dirty = renderContent(
    '<script>alert(1)</script><img src="https://example.org/a.png" onerror="alert(2)"><a href="javascript:alert(1)">текст</a>',
  )
  assert.ok(!/script|onerror|javascript/.test(dirty))
  assert.match(dirty, /<img/)
  assert.equal(
    contentUrl('https://pivkarta.ru/beer/715/?x=1#comments'),
    '/beer/715/?x=1#comments',
  )
})
test('Исторические карточки ведут одним 301 к тому же объекту', async () => {
  for (const [path, id] of [
    ['/beer/715', 715],
    ['/sort/show/715', 715],
    ['/moskva/sort/show/715', 715],
    ['/moskva/sort/show/715/old/', 715],
    ['/beer/1740/tropic-banana-&-passion-fruit-smoothie', 1740],
    ['/place/show/3210', 3210],
    ['/place/show/3210/old', 3210],
    ['/moskva/place/show/3210/hmeleff-na-veernoy/', 3210],
    ['/place/3210/hmeleff-na-veernoy/@55.753215,37.622504,12', 3210],
    ['/place/10222/Paulaner-Brauhaus-Moscow-Paveletsky/', 10222],
    ['/place/10861/bar-svin-&-gus-/', 10861],
  ]) {
    const value = await resolve(`${path}?ref=проверка`)
    assert.match(value.path, new RegExp(`/${id}/`))
    const can = canonical(value.html)
    assert.ok(can, path)
    assert.equal(
      (await get(new URL(can).pathname + new URL(can).search)).status,
      200,
      can,
    )
    assert.ok(!value.html.includes('Страница не найдена'), path)
  }
})
test('Каталоги, поиск и городские входы содержат записи в HTML', async () => {
  for (const [path, link] of [
    ['/beer/showlist/', '/beer/'],
    ['/beer/showlist/?page=2', '/beer/'],
    ['/companies?page=2', '/place/'],
    ['/place/showlist/?page=2', '/place/'],
    ['/place/index/type/bar/', '/place/'],
    ['/place/index/type/shop/', '/place/'],
    ['/place/index/type/brewery/', '/place/'],
    ['/moskva/place/showlist/', '/place/'],
    ['/moskva/beer/showlist/', '/beer/'],
    ['/moskva/sort/showlist/', '/beer/'],
    ['/blog/showlist/', '/topics/'],
    ['/topics', '/topics/'],
    ['/profile/showlist/', '/profile/show/'],
    ['/comments/', '/comments/comment-'],
    ['/city/', '/moskva/'],
    ['/map/?beer_id=715', '/place/'],
  ]) {
    const value = await resolve(path)
    assert.ok(value.html.includes(`href="${link}`), path)
    assert.ok(!value.html.includes('Загрузка заведений…'), path)
  }
  const search = await get('/beer/showlist/?name=Хмелефф')
  assert.equal(search.status, 200)
  assert.match(search.html, /value="Хмелефф"/)
  assert.match(search.html, /href="\/beer\/571\//)
  const empty = await get('/beer/showlist/?name=несуществующийсорт999999')
  assert.equal(empty.status, 200)
  assert.match(empty.html, /Записей не найдено/)
})
test('Разделы заведений открываются без редиректа и сохраняют адрес при поиске и пагинации', async () => {
  for (const [kind, title] of [
    ['shop', 'Магазины'],
    ['bar', 'Бары'],
    ['brewery', 'Пивоварни'],
  ]) {
    const path = `/place/index/type/${kind}/`
    for (const query of [
      '',
      '?page=2',
      '?name=несуществующеезаведение999999',
      '?city=moskva',
    ]) {
      const value = await get(`${path}${query}`)
      assert.equal(value.status, 200, `${path}${query}`)
      assert.equal(value.location, null)
      assert.ok(value.html.includes(title))
      assert.equal(new URL(canonical(value.html)).pathname, path)
      assert.ok(value.html.includes(`action="${path}"`))
      if (!query) assert.ok(value.html.includes(`href="${path}?page=2"`))
    }
    assert.equal((await get(`${path.slice(0, -1)}.data`)).status, 200)
  }
  assert.equal((await get('/place/index/type/unknown/')).status, 404)
  const sitemap = await get('/sitemap.xml?section=main')
  for (const kind of ['shop', 'bar', 'brewery']) {
    assert.ok(sitemap.html.includes(`/place/index/type/${kind}/`))
  }
  assert.ok(!sitemap.html.includes('/companies?type='))
})
test('Публикации, профили, комментарии, контакты и городские карты доступны', async () => {
  for (const path of [
    '/blog/show/1222/',
    '/topics/festival-%22den-piva%22-2022-v-armenii/',
    '/profile/show/26714/',
    '/profile/li/',
    '/comments/comment-4107.html',
    '/contacts.html',
    '/moskva/',
    '/sankt-peterburg/',
    '/city/moskva/@55.753215,37.622504,12',
    '/moskva/place/index/type/bar/',
    '/map/@55.753215,37.622504,12',
    '/places/create/',
    '/beer/create/',
    '/topics/create/',
  ])
    await resolve(path)
})
test('Связи пива и заведений, старые якоря и безопасный контент', async () => {
  const company = await get('/place/3210/hmeleff-na-veernoy/')
  assert.equal(company.status, 200)
  assert.match(company.html, /href="\/beer\/571\/hmeleff\/"/)
  assert.match(company.html, /id="beersBlock"/)
  assert.match(company.html, /id="comments"/)
  const beer = await get('/beer/715/tomskoe-barhatnoe/')
  assert.match(beer.html, /href="\/place\/891\//)
  assert.match(beer.html, /Сварено по традиционным/)
})
test('Отсутствующие записи и страницы выдачи не превращаются в успешные пустые страницы', async () => {
  for (const path of [
    '/audit-missing-url-20260929/',
    '/place/2147483647/missing/',
    '/beer/2147483647/missing/',
    '/topics/нет-такой-статьи/',
    '/companies?page=99999',
    '/beer/showlist/?page=99999',
    '/place/3210/hmeleff-na-veernoy/?page=99999',
    '/unknown-city/place/showlist/',
    '/map/?city=unknown-city',
    '/assets/missing-file.js',
  ])
    assert.equal((await get(path)).status, 404, path)
  for (const path of [
    '/companies?page=-1',
    '/beer/showlist/?page=NaN',
    '/map/@999,37,12',
  ])
    assert.equal((await get(path)).status, 400, path)
})
test('Служебные запросы React Router не зацикливаются', async () => {
  for (const path of [
    '/beer/715/tomskoe-barhatnoe.data',
    '/companies.data?page=2',
    '/place/3210/hmeleff-na-veernoy.data',
  ])
    assert.equal((await get(path)).status, 200, path)
})
test('Sitemap использует канонические адреса всех семейств', async () => {
  const root = await get('/sitemap.xml')
  assert.equal(root.status, 200)
  assert.match(root.html, /sitemapindex/)
  for (const section of ['beers', 'places', 'topics', 'users', 'comments']) {
    const value = await get(`/sitemap.xml?section=${section}&page=1`)
    assert.equal(value.status, 200)
    const first = value.html
      .match(/<loc>(.*?)<\/loc>/)?.[1]
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    assert.ok(first, section)
    const target = new URL(first)
    assert.equal(
      (await get(target.pathname + target.search)).status,
      200,
      first,
    )
  }
})

test('Слеши и @ в исторических именах, последние страницы старых каталогов', async () => {
  for (const path of [
    '/beer/822/burgomistr_/_burgermeister/',
    '/place/804/templ_bar_/_temple_bar_v_krilatskom/',
    '/profile/@kol22/',
    '/profile/1/2/3//',
    '/beer/showlist/?page=137',
    '/companies?page=241',
  ])
    await resolve(path)
})

test('Старый контент сохраняет нумерацию и описание при пустом редакторе', () => {
  const html = renderContent({
    blocks: [
      { text: 'Первый', type: 'ordered-list-item' },
      { text: 'Второй', type: 'ordered-list-item' },
    ],
  })
  assert.equal((html.match(/<ol>/g) || []).length, 1)
  assert.match(
    renderContent({ blocks: [] }, 'Сохранённое описание'),
    /Сохранённое описание/,
  )
})

test('Типовые страницы не содержат служебных описаний и пустых разделов', async () => {
  for (const path of [
    '/',
    '/companies',
    '/place/index/type/shop/',
    '/place/index/type/bar/',
    '/place/index/type/brewery/',
    '/beer/showlist/',
    '/beer/715/tomskoe-barhatnoe/',
    '/place/3210/hmeleff-na-veernoy/',
    '/blog/showlist/',
    '/blog/show/1222/',
    '/profile/showlist/',
    '/profile/show/12689/',
    '/profile/show/26714/',
    '/comments/',
    '/comments/comment-4107.html',
    '/city/',
    '/map/',
    '/contacts.html',
    '/places/create/',
    '/beer/create/',
    '/topics/create/',
  ]) {
    const value = await resolve(path)
    assert.doesNotMatch(
      value.html,
      /Материалы и связи|старой [«&]|старой базы|старого проекта|Сведения из архива|HAIH|haih\.site|Описание пока|Ассортимент пока|Записей пока|новой версии пока/,
      path,
    )
    const main = value.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
    assert.ok(main, path)
    assert.doesNotMatch(
      main,
      /Записей не найдено|Не указан[аы]?|Сорт не указан/,
      path,
    )
    for (const section of main.matchAll(
      /<section\b[^>]*>([\s\S]*?)<\/section>/g,
    )) {
      assert.ok(
        section[1]
          .replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/g, '')
          .replace(/<[^>]*>/g, '')
          .trim() || /<(?:img|iframe)\b/.test(section[1]),
        `Пустой раздел: ${path}`,
      )
    }
  }
  const profile = await get('/profile/show/12689/')
  const main = profile.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
  assert.match(main, /Абраамян/)
  assert.doesNotMatch(main, /<h2\b|Записей не найдено|Материалы и связи/)
})
