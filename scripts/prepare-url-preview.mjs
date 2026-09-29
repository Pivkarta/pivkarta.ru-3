import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
const directory = '/tmp/piv-url-preview'
await mkdir(directory, { recursive: true })
for (const name of ['compose.yaml', 'dynamic.yaml'])
  await copyFile(`docker/url-preview/${name}`, `${directory}/${name}`)
const vcl = (await readFile('docker/varnish/default.vcl', 'utf8'))
  .replace('.host = "app";', '.host = "host.docker.internal";')
  .replace('.port = "3000";', '.port = "3107";')
await writeFile(`${directory}/default.vcl`, vcl)
execFileSync(
  'openssl',
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    `${directory}/key.pem`,
    '-out',
    `${directory}/cert.pem`,
    '-days',
    '2',
    '-subj',
    '/CN=pivkarta.ru',
    '-addext',
    'subjectAltName=DNS:pivkarta.ru,DNS:www.pivkarta.ru',
  ],
  { stdio: 'ignore' },
)
console.log(
  'Подготовлен изолированный HTTPS-предпросмотр в /tmp/piv-url-preview. Нужен Node.js на порту 3107; запуск: docker compose -f /tmp/piv-url-preview/compose.yaml up -d',
)
