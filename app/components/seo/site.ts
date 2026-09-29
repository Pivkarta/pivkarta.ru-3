export const site: {
  origin: string
  name: string
  language: string
  description: string
} = {
  origin: import.meta.env?.VITE_SITE_ORIGIN || 'http://localhost:3000',
  name: 'Пивная карта',
  language: 'ru',
  description:
    'Пиво, его описания и фотографии, связанные бары, пабы, магазины и пивоварни в разных городах — на «Пивной карте».',
}

// Preserve the identity published at https://fi1osof.ru/about.
// ORCID was supplied by the author; no live profile lookup is required at build time.
export const author = {
  '@type': 'Person' as const,
  '@id': 'https://fi1osof.ru/about',
  name: 'Nikolai Lanets',
  alternateName: ['Fi1osof'],
  url: 'https://fi1osof.ru/about',
  sameAs: [
    'https://orcid.org/0009-0007-9285-0801',
    'https://github.com/fi1osof',
    'https://www.linkedin.com/in/fi1osof',
    'https://habr.com/ru/users/fi1osof/',
    'https://modx.pro/users/real-fi1osof',
    'https://npmx.dev/~fi1osof',
    'https://freecode.academy/profile/Fi1osof',
    'https://web3.bio/fi1osof.lens',
  ],
}

export function canonicalUrl(path: string, origin: string = site.origin): string {
  const url = new URL(path, origin)
  if (url.origin !== origin) {
    throw new Error(
      'Канонические страницы должны принадлежать настроенному домену сайта',
    )
  }
  url.hash = ''
  const allowed = new Set([
    'page',
    'comments_page',
    'topics_page',
    'name',
    'color',
    'container',
    'filtered',
    'pasteurized',
    'city',
    'type',
    'beer_id',
    'place_id',
    'beer',
    'search',
    'section',
  ])
  for (const key of [...url.searchParams.keys()]) {
    if (
      !allowed.has(key) ||
      (['page', 'comments_page', 'topics_page'].includes(key) &&
        url.searchParams.get(key) === '1')
    ) {
      url.searchParams.delete(key)
    }
  }
  url.searchParams.sort()
  return url.href
}
