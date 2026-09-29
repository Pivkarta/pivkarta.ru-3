/** Служебный запрос React Router может опускать завершающий слеш. */
export function isCompanyCanonicalPath(pathname: string, uri: string): boolean {
  if (!pathname.endsWith('.data')) {
    return pathname === uri
  }
  const documentPath = pathname.endsWith('/_.data')
    ? pathname.slice(0, -6)
    : pathname.slice(0, -5)
  return documentPath.replace(/\/+$/, '') === uri.replace(/\/+$/, '')
}
