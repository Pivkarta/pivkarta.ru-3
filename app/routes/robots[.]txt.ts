import { canonicalUrl } from '../components/seo/site'
export const loader = (): Response =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${canonicalUrl('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
