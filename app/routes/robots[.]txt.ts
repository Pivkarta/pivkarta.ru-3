import type { LoaderFunctionArgs } from 'react-router'
import { canonicalUrl } from '../components/seo/site'
export const loader = ({ request }: LoaderFunctionArgs): Response =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${canonicalUrl('/sitemap.xml', new URL(request.url).origin)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
