/** Слаг берётся из базы без транслитерации, смены регистра и повторного декодирования. */
export function objectPath(
  kind: 'beer' | 'place',
  id: number | null,
  slug?: string | null,
): string {
  return `/${kind}/${id}/${slug ? `${encodeURIComponent(slug)}/` : ''}`
}
export function topicPath(id: number | null, slug?: string | null): string {
  return slug ? `/topics/${encodeURIComponent(slug)}/` : `/blog/show/${id}/`
}
export function profilePath(id: number | null): string {
  return `/profile/show/${id}/`
}
export function commentPath(id: number | null): string {
  return `/comments/comment-${id}.html`
}
export function pageLink(
  path: string,
  query: string,
  page: number,
  parameter = 'page',
): string {
  const params = new URLSearchParams(query)
  if (page === 1) {
    params.delete(parameter)
  } else {
    params.set(parameter, String(page))
  }
  return `${path}${params.size ? `?${params}` : ''}`
}
