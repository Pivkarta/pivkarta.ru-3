import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { once } from 'node:events'
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import express from 'express'
import sharp from 'sharp'
import { createImageThumbMiddleware } from '../server/middleware/ImageThumb/index.ts'

test('Миниатюры: размеры, старые URL, HTTP и защита путей', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'pivkarta-images-'))
  const app = express()
  app.use('/images', createImageThumbMiddleware(root))
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(root, { recursive: true, force: true })
  })
  const base = `http://127.0.0.1:${server.address().port}/images`
  await sharp({
    create: { width: 1200, height: 600, channels: 3, background: '#ff0000' },
  })
    .png()
    .toFile(join(root, 'тест фото.png'))
  await sharp({
    create: { width: 20, height: 10, channels: 3, background: '#ff0000' },
  })
    .png()
    .toFile(join(root, 'small.png'))
  await writeFile(join(root, 'broken.png'), 'не изображение')
  await symlink('/etc/passwd', join(root, 'outside.png'))
  const name = encodeURIComponent('тест фото.png')
  for (const [type, width, height] of [
    ['origin', 1200, 600],
    ['big', 1000, 500],
    ['thumb', 150, 75],
    ['avatar', 200, 200],
    ['place_avatar', 250, 250],
    ['dot_thumb', 40, 30],
    ['slider_thumb', 300, 400],
  ]) {
    const response = await fetch(`${base}/${type}/${name}`)
    assert.equal(response.status, 200, type)
    assert.equal(
      response.headers.get('cache-control'),
      process.env.NODE_ENV === 'production'
        ? 'public, max-age=2592000'
        : 'no-store',
    )
    assert.match(response.headers.get('content-type'), /^image\/png/)
    const metadata = await sharp(
      Buffer.from(await response.arrayBuffer()),
    ).metadata()
    assert.deepEqual([metadata.width, metadata.height], [width, height], type)
  }
  for (const path of [
    `thumb/uploads/${name}`,
    `resized/thumb/uploads/${name}`,
    `resized/thumb/${name}`,
  ]) {
    assert.equal((await fetch(`${base}/${path}`)).status, 200)
  }
  const small = await fetch(`${base}/big/small.png`)
  const metadata = await sharp(
    Buffer.from(await small.arrayBuffer()),
  ).metadata()
  assert.equal(metadata.width, 20)
  const response = await fetch(`${base}/thumb/${name}`)
  const etag = response.headers.get('etag')
  assert.ok(etag)
  assert.equal(
    (
      await fetch(`${base}/thumb/${name}`, {
        headers: { 'If-None-Match': etag },
        cache: 'force-cache',
      })
    ).status,
    304,
  )
  const head = await fetch(`${base}/thumb/${name}`, { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  for (const [path, status] of [
    ['thumb/missing.png', 404],
    ['thumb/outside.png', 404],
    ['thumb/broken.png', 422],
    ['wrong/small.png', 400],
    ['__proto__/small.png', 400],
    ['thumb/%2e%2e%2fpackage.json', 400],
    ['thumb/%00', 400],
    ['thumb/%FF', 400],
  ]) {
    const failure = await fetch(`${base}/${path}`)
    assert.equal(failure.status, status, path)
    assert.equal(failure.headers.get('cache-control'), 'no-store')
  }
  assert.equal(
    (await fetch(`${base}/thumb/${name}`, { method: 'POST' })).status,
    405,
  )
})
