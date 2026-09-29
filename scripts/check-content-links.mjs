/* global AbortSignal */
import { readFile, writeFile, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { decodeHTML } from 'entities'
const directory = 'projects/tasks/003--url-structure/'
const report = JSON.parse(await readFile(`${directory}url-check.json`, 'utf8'))
const origin = process.env.URL_TEST_ORIGIN || 'http://localhost:3107'
const links = report.internalLinks.map(decodeHTML)
const resources = [],
  pages = []
const root = resolve('uploads')
for (const path of links) {
  if (path.startsWith('/images/')) {
    let file = decodeURIComponent(new URL(path, origin).pathname).replace(
      /^\/images\/(?:resized\/)?[^/]+\/(?:uploads\/)?/,
      '',
    )
    const target = resolve(root, file)
    const exists =
      target.startsWith(root + sep) &&
      (await stat(target)
        .then((value) => value.isFile())
        .catch(() => false))
    resources.push({ path, exists })
  } else pages.push(path)
}
let index = 0
const failures = [],
  redirects = []
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (index < pages.length) {
      const path = pages[index++]
      try {
        const response = await fetch(origin + path, {
          redirect: 'manual',
          signal: AbortSignal.timeout(30000),
        })
        await response.arrayBuffer()
        if (response.status === 301)
          redirects.push({ path, target: response.headers.get('location') })
        else if (response.status !== 200)
          failures.push({ path, status: response.status })
      } catch (error) {
        failures.push({ path, error: error.message })
      }
    }
  }),
)
const result = {
  date: new Date().toISOString(),
  pages: pages.length,
  failures,
  redirects,
  resources: resources.length,
  missingResources: resources.filter((row) => !row.exists),
}
await writeFile(
  `${directory}content-links.json`,
  JSON.stringify(result, null, 2) + '\n',
)
console.log(
  JSON.stringify({
    ...result,
    redirects: redirects.length,
    missingResources: result.missingResources.length,
  }),
)
