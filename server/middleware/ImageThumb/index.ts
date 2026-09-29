import type { RequestHandler } from 'express'
import { realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import sharp, { type ResizeOptions } from 'sharp'

const sizes: Readonly<Record<string, ResizeOptions>> = {
  big: { width: 1000, withoutEnlargement: true },
  thumb: { width: 150, withoutEnlargement: true },
  avatar: { width: 200, height: 200, fit: 'cover', position: 'entropy' },
  place_avatar: {
    width: 250,
    height: 250,
    fit: 'contain',
    background: '#ffffff',
  },
  dot_thumb: { width: 40, height: 30, fit: 'cover', position: 'entropy' },
  slider_thumb: { width: 300, height: 400, fit: 'cover', position: 'entropy' },
}

function inside(root: string, path: string): boolean {
  const part = relative(root, path)
  return (
    part !== '' &&
    part !== '..' &&
    !part.startsWith(`..${sep}`) &&
    !isAbsolute(part)
  )
}

/** Обрабатывает оба исторических варианта URL внутри /images. */
export function createImageThumbMiddleware(
  uploadsDirectory: string = resolve('uploads'),
): RequestHandler {
  return async (req, res): Promise<void> => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD')
      res.status(405).send('Метод не поддерживается')
      return
    }

    let parts: string[]
    try {
      parts = decodeURIComponent(req.url.split('?')[0]).split('/').slice(1)
    } catch {
      res.status(400).send('Некорректный адрес изображения')
      return
    }
    if (parts[0] === 'resized') {
      parts.shift()
    }
    const type = parts.shift() ?? ''
    if (type !== 'origin' && !Object.hasOwn(sizes, type)) {
      res.status(400).send('Неизвестный размер изображения')
      return
    }
    if (parts[0] === 'uploads') {
      parts.shift()
    }
    if (
      !parts.length ||
      parts.some(
        (part) =>
          !part ||
          part.startsWith('.') ||
          part.includes('\\') ||
          part.includes('\0'),
      )
    ) {
      res.status(400).send('Некорректный путь изображения')
      return
    }

    let file: string
    try {
      const root = await realpath(uploadsDirectory)
      file = await realpath(resolve(root, ...parts))
      if (!inside(root, file) || !(await stat(file)).isFile()) {
        res.status(404).send('Изображение не найдено')
        return
      }
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT' && code !== 'ENOTDIR') {
        console.error('Не удалось прочитать изображение:', error)
        res.status(500).send('Не удалось прочитать изображение')
        return
      }
      res.status(404).send('Изображение не найдено')
      return
    }

    try {
      let img = sharp(file, { limitInputPixels: 40_000_000 }).rotate()
      if (type !== 'origin') {
        img = img.resize(sizes[type])
      }
      if (type === 'place_avatar') {
        img = img.png()
      }
      const { data, info } = await img.toBuffer({ resolveWithObject: true })
      res.setHeader(
        'Cache-Control',
        process.env.NODE_ENV === 'production'
          ? 'public, max-age=2592000'
          : 'no-store',
      )
      res.type(`image/${info.format}`).send(data)
    } catch {
      res.status(422).send('Не удалось обработать изображение')
    }
  }
}
