/* global AbortSignal */
import { writeFile } from 'node:fs/promises'
const pending = ['https://pivkarta.ru/sitemap.xml']
const seen = new Set(),
  pages = [],
  urls = new Set()
while (pending.length) {
  const url = pending.shift()
  if (seen.has(url)) continue
  seen.add(url)
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) {
    pages.push({ url, status: response.status })
    console.log('Ошибка', response.status, url)
    continue
  }
  const xml = await response.text()
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)].map((m) =>
    m[1].replaceAll('&amp;', '&'),
  )
  if (xml.includes('<sitemapindex'))
    pending.push(...locations.map((value) => value.replace('http:', 'https:')))
  else locations.forEach((value) => urls.add(value))
  pages.push({ url, count: locations.length })
  console.log(url, locations.length)
}
await writeFile(
  'projects/tasks/003--url-structure/old-sitemap.json',
  JSON.stringify(
    { fetchedAt: new Date().toISOString(), pages, urls: [...urls].sort() },
    null,
    2,
  ) + '\n',
)
console.log('Всего URL:', urls.size)
