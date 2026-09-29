/* global AbortSignal */
import { readFile, writeFile } from 'node:fs/promises'
const directory = 'projects/tasks/003--url-structure/'
const paths = JSON.parse(
  await readFile(`${directory}content-links.json`, 'utf8'),
).failures.map((row) => row.path)
const results = []
for (const path of paths) {
  const response = await fetch('https://pivkarta.ru' + path, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
  })
  const html = await response.text()
  const row = {
    path,
    status: response.status,
    title: html.match(/<title[^>]*>(.*?)<\/title>/)?.[1],
    location: response.headers.get('location'),
  }
  results.push(row)
  console.log(JSON.stringify(row))
}
await writeFile(
  `${directory}legacy-exceptions.json`,
  JSON.stringify(results, null, 2) + '\n',
)
