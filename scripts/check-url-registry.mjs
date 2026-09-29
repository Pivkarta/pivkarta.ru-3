/* global AbortSignal */
import { decodeHTML } from 'entities'
import { readFile, writeFile } from 'node:fs/promises'
const directory = 'projects/tasks/003--url-structure/'
const registry = JSON.parse(
  await readFile(`${directory}url-registry.json`, 'utf8'),
)
const origin = process.env.URL_TEST_ORIGIN || 'http://localhost:3107'
const mode = process.env.URL_CHECK_MODE || 'all'
const entries =
  mode === 'failed'
    ? JSON.parse(await readFile(`${directory}url-check.json`, 'utf8'))
        .failures.map((f) =>
          registry.records.find((r) => r.source === f.source),
        )
        .filter(Boolean)
    : registry.records
const failures = [],
  checks = [],
  links = new Set()
let position = 0,
  completed = 0
function decode(value) {
  return decodeHTML(value)
}
async function worker() {
  while (position < entries.length) {
    const row = entries[position++]
    try {
      const response = await fetch(origin + row.source, {
        redirect: 'manual',
        signal: AbortSignal.timeout(30000),
      })
      const html = await response.text()
      if (response.status !== row.status)
        throw new Error(`Ожидался ${row.status}, получен ${response.status}`)
      if (row.status === 301 && response.headers.get('location') !== row.target)
        throw new Error(`Неверная цель: ${response.headers.get('location')}`)
      if (row.status === 200) {
        if (!html.includes('<h1')) throw new Error('Нет основного заголовка')
        const match = html.match(/<link rel="canonical" href="([^"]+)"/)
        if (!match) throw new Error('Нет canonical')
        const canonical = new URL(decode(match[1]))
        if (canonical.pathname + canonical.search !== row.target)
          throw new Error(
            `Неверный canonical: ${canonical.pathname + canonical.search}`,
          )
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || ''
        for (const item of main.matchAll(/(?:href|src)="(\/[^"#]*)"/g))
          links.add(decode(item[1]))
      }
      checks.push({ source: row.source, status: response.status })
    } catch (error) {
      failures.push({ source: row.source, message: error.message })
    }
    if (++completed % 2000 === 0)
      console.log(
        `Проверено ${completed}/${entries.length}, ошибок ${failures.length}`,
      )
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
const report = {
  date: new Date().toISOString(),
  origin,
  mode,
  total: entries.length,
  passed: checks.length,
  failures,
  internalLinks: [...links].sort(),
}
await writeFile(
  `${directory}url-check${mode === 'failed' ? '-retry' : ''}.json`,
  JSON.stringify(report, null, 2) + '\n',
)
console.log(
  JSON.stringify({ ...report, internalLinks: report.internalLinks.length }),
)
if (failures.length) process.exitCode = 1
