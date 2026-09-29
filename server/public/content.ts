import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'
import { marked } from 'marked'

export function jsonValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
/** Внутренние абсолютные URL старого сайта остаются в текущем приложении. */
export function contentUrl(value: string, base = '/'): string {
  try {
    const url = new URL(value, `https://pivkarta.ru${base}`)
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return ''
    }
    return ['pivkarta.ru', 'www.pivkarta.ru'].includes(url.hostname)
      ? `${url.pathname}${url.search}${url.hash}`
      : url.href
  } catch {
    return ''
  }
}
export function imageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  if (/^(https?:)?\/\//.test(value)) {
    return contentUrl(value) || undefined
  }
  if (value.startsWith('/images/')) {
    return value
  }
  return `/images/origin/${value
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`
}
export function galleryImages(value: unknown): string[] {
  const items = jsonValue(value)
  return Array.isArray(items)
    ? [...new Set(items.map(imageUrl).filter((v): v is string => Boolean(v)))]
    : []
}
export function renderContent(
  value: unknown,
  fallback = '',
  base = '/',
): string {
  const parsed = jsonValue(value)
  const root = record(parsed)
  let html: string
  if (Array.isArray(root.blocks)) {
    const entities = record(root.entityMap)
    html = root.blocks
      .map((value: unknown) => {
        const block = record(value)
        const text = typeof block.text === 'string' ? block.text : ''
        const ranges = Array.isArray(block.entityRanges)
          ? block.entityRanges.map(record)
          : []
        if (block.type === 'atomic') {
          return ranges
            .map((range) => {
              const entity = record(entities[String(range.key)])
              const source = record(entity.data)
              const src = imageUrl(source.src)
              return entity.type === 'IMAGE' && src
                ? `<img src="${escape(src)}" alt="${escape(String(source.alt || ''))}" loading="lazy">`
                : ''
            })
            .join('')
        }
        const styles = Array.isArray(block.inlineStyleRanges)
          ? block.inlineStyleRanges.map(record)
          : []
        const valid = [...ranges, ...styles].filter(
          (range) =>
            Number.isInteger(range.offset) &&
            Number.isInteger(range.length) &&
            Number(range.offset) >= 0 &&
            Number(range.length) > 0 &&
            Number(range.offset) + Number(range.length) <= text.length,
        )
        const boundaries = [
          ...new Set([
            0,
            text.length,
            ...valid.flatMap((range) => [
              Number(range.offset),
              Number(range.offset) + Number(range.length),
            ]),
          ]),
        ].sort((a, b) => a - b)
        const styleTags: Record<string, string> = {
          BOLD: 'strong',
          ITALIC: 'em',
          UNDERLINE: 'u',
          STRIKETHROUGH: 's',
          CODE: 'code',
        }
        let result = ''
        for (let index = 0; index < boundaries.length - 1; index++) {
          const start = boundaries[index],
            end = boundaries[index + 1]
          let segment = escape(decodeHTML(text.slice(start, end)))
          const contains = (range: Record<string, unknown>): boolean =>
            Number(range.offset) <= start &&
            Number(range.offset) + Number(range.length) >= end
          for (const style of styles.filter(contains)) {
            const tag = styleTags[String(style.style)]
            if (tag) {
              segment = `<${tag}>${segment}</${tag}>`
            }
          }
          const range = ranges.find(contains)
          const entity = range ? record(entities[String(range.key)]) : {}
          const href = contentUrl(String(record(entity.data).url || ''), base)
          if (entity.type === 'LINK' && href) {
            segment = `<a href="${escape(href)}">${segment}</a>`
          }
          result += segment
        }
        const tags: Record<string, string> = {
          'header-one': 'h2',
          'header-two': 'h2',
          'header-three': 'h3',
          blockquote: 'blockquote',
          'code-block': 'pre',
        }
        const tag = tags[String(block.type)] || 'p'
        if (block.type === 'unordered-list-item') {
          return `<ul><li>${result}</li></ul>`
        }
        if (block.type === 'ordered-list-item') {
          return `<ol><li>${result}</li></ol>`
        }
        return `<${tag}>${result}</${tag}>`
      })
      .join('\n')
  } else {
    html = marked.parse(
      typeof parsed === 'string' && parsed.trim() ? parsed : fallback,
      { async: false },
    )
  }
  html = html.replace(/<\/ol>\s*<ol>/g, '').replace(/<\/ul>\s*<ul>/g, '')
  if (!html.includes('<img') && !plainText(html).trim() && fallback) {
    html = marked.parse(fallback, { async: false })
  }
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'loading'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: 'a',
        attribs: { ...attrs, href: contentUrl(attrs.href || '', base) },
      }),
      img: (_tag, attrs) => ({
        tagName: 'img',
        attribs: {
          ...attrs,
          src: contentUrl(attrs.src || '', base),
          loading: 'lazy',
        },
      }),
    },
  })
}

export function plainText(value: string): string {
  return decodeHTML(
    sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }),
  )
}
