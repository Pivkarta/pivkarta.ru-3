import type { MetaFunction, LoaderFunctionArgs } from 'react-router'
import { CompanyPage, CompanyError } from '../pages/Companies/Company'
import { loadCompany } from '../pages/Companies/Company/load.server'
import { createSeoMeta } from '../components/seo/SeoHeaders'
import type { CompanyPageData } from '../pages/Companies/Company/load.server'

export const loader = (args: LoaderFunctionArgs): Promise<CompanyPageData> =>
  loadCompany(args)

export const meta: MetaFunction<typeof loader> = ({ loaderData, location }) => {
  const company = loaderData?.oldCompany
  return createSeoMeta(
    company
      ? {
          title: `${company.name || 'Заведение'} — Пивная карта`,
          description:
            `${company.name || 'Заведение'}: адрес, контакты и ассортимент пива. ${company.address || ''}`.trim(),
          path: `${company.uri}${location.search}`,
        }
      : {
          title: 'Заведение недоступно — Пивная карта',
          description: 'Не удалось загрузить сведения о заведении.',
          noindex: true,
        },
  )
}

export const ErrorBoundary: React.FC = CompanyError
export default CompanyPage
