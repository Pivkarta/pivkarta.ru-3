import { readFile, writeFile } from 'node:fs/promises'
import https from 'node:https'
import http from 'node:http'
import assert from 'node:assert/strict'
const ca = await readFile('/tmp/piv-url-preview/cert.pem')
function request(path, host = 'pivkarta.ru', secure = true) {
  return new Promise((resolve, reject) => {
    const req = (secure ? https : http).request(
      {
        hostname: '127.0.0.1',
        port: secure ? 3143 : 3180,
        path,
        headers: { Host: host },
        ...(secure ? { servername: host, ca } : {}),
      },
      (res) => {
        let html = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (html += chunk))
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, html }),
        )
      },
    )
    req.on('error', reject)
    req.setTimeout(30000, () => req.destroy(new Error('Истекло время запроса')))
    req.end()
  })
}
const checks = []
for (const path of [
  '/',
  '/companies?page=2',
  '/beer/715/tomskoe-barhatnoe/',
  '/place/3210/hmeleff-na-veernoy/',
  '/blog/showlist/',
  '/sitemap.xml?section=beers&page=1',
  '/robots.txt',
]) {
  const result = await request(path)
  assert.equal(result.status, 200, path)
  const content =
    path.includes('sitemap') || path.includes('robots')
      ? result.html
      : result.html.match(/<head>([\s\S]*?)<\/head>/)[1]
  assert.ok(content.includes('https://pivkarta.ru'), path)
  assert.ok(!content.includes('localhost'), path)
  const cached = await request(path)
  assert.equal(cached.headers['x-cache'], 'HIT', path)
  checks.push({
    path,
    status: result.status,
    cache: cached.headers['x-cache'],
    ttl: cached.headers['x-cache-ttl'],
  })
}
for (const [host, secure] of [
  ['pivkarta.ru', false],
  ['www.pivkarta.ru', false],
  ['www.pivkarta.ru', true],
]) {
  const result = await request(
    '/beer/715/tomskoe-barhatnoe/?page=1',
    host,
    secure,
  )
  assert.equal(result.status, 301)
  assert.equal(
    result.headers.location,
    'https://pivkarta.ru/beer/715/tomskoe-barhatnoe/?page=1',
  )
  checks.push({
    host,
    secure,
    status: result.status,
    location: result.headers.location,
  })
}
for (const path of [
  '/url-preview-missing/',
  '/assets/url-preview-missing.js',
  '/companies?page=99999',
]) {
  const result = await request(path)
  assert.equal(result.status, 404, path)
  checks.push({ path, status: result.status })
}
await writeFile(
  'projects/tasks/003--url-structure/production-preview.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      environment:
        'Изолированный локальный HTTPS-предпросмотр; публичный сайт не менялся',
      checks,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  'Проверки HTTPS, canonical, sitemap, кеша, редиректов и 404:',
  checks.length,
)
