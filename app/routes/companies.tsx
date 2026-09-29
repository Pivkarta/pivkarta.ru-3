import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { createSeoMeta, unavailableSeoMeta } from '../components/seo/SeoHeaders'
import { PublicPage, PublicError } from '../pages/Public'
import { loadPublic } from '../pages/Public/load.server'
import type { PublicPageData } from '../pages/Public/types'

export const loader = (args: LoaderFunctionArgs): Promise<PublicPageData> =>
  loadPublic(args)
export const meta: MetaFunction<typeof loader> = ({ loaderData, error }) =>
  error || !loaderData
    ? unavailableSeoMeta()
    : createSeoMeta({
        title: `${loaderData.title} — Пивная карта`,
        description:
          loaderData.description || `${loaderData.title} — Пивная карта.`,
        path: loaderData.canonical || loaderData.path,
        noindex: loaderData.noindex,
      })
export const ErrorBoundary: React.FC = PublicError
export default PublicPage
