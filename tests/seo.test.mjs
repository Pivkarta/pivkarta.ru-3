import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { canonicalUrl, site } from '../app/components/seo/site.ts'
import { serializeJsonLd } from '../app/components/seo/JsonLd/helpers.ts'

test('Canonical сохраняет слеши и смысловые параметры, удаляет метки и якорь', () => {
  assert.equal(
    canonicalUrl(
      '/beer/715/tomskoe-barhatnoe/?page=2&utm_source=test#comments',
    ),
    `${site.origin}/beer/715/tomskoe-barhatnoe/?page=2`,
  )
  assert.equal(
    canonicalUrl('/companies?page=1&type=bar'),
    `${site.origin}/companies?type=bar`,
  )
  assert.throws(() => canonicalUrl('https://other.example/article'))
})
test('JSON-LD безопасен для помещения в HTML', () => {
  const value = {
    '@context': 'https://schema.org',
    name: '</script><script>alert(1)</script>',
  }
  const json = serializeJsonLd(value)
  assert.ok(!json.includes('<'))
  assert.deepEqual(JSON.parse(json), value)
})
test('Предварительно отрисованная главная содержит метаданные и реальные внутренние ссылки', () => {
  const html = readFileSync(
    new URL('../build/client/index.html', import.meta.url),
    'utf8',
  )
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.match(head, /<title>[^<]*Пивная карта/)
  assert.match(head, /property="og:url"/)
  assert.ok(!head.includes('noindex'))
  for (const path of [
    '/beer/showlist/',
    '/beer/715/tomskoe-barhatnoe/',
    '/companies',
    '/blog/showlist/',
  ])
    assert.ok(html.includes(`href="${path}"`), path)
})
