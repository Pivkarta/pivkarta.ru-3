/** Исторические ссылки на прежний сайт открываются внутри нового приложения. */
export function websiteUrl(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined
  }
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return undefined
    }
    const hostname = url.hostname.replace(/\.$/, '')
    if (hostname === 'pivkarta.ru' || hostname.endsWith('.pivkarta.ru')) {
      return `/${url.pathname.replace(/^\/+/, '')}${url.search}${url.hash}`
    }
    return url.href
  } catch {
    return undefined
  }
}
