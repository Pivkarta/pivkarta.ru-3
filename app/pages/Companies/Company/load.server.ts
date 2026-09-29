import {
  renderContent,
  imageUrl,
  galleryImages,
} from '../../../../server/public/content'
import { companyExtras } from '../../../../server/public/data'
import type { PublicSection } from '../../Public/types'

import { isCompanyCanonicalPath } from './routePath'
import { execute } from 'graphql'
import { data, redirect, type LoaderFunctionArgs } from 'react-router'
import { schema } from 'server/schema'
import { knexClient } from 'server/knex'
import {
  OldCompanyDocument,
  type OldCompanyQuery,
} from 'app/gql/generated/oldCompany'

export interface CompanyPageData extends OldCompanyQuery {
  presentation: {
    html: string
    image?: string
    gallery: string[]
    sections: PublicSection[]
  }
}

export async function loadCompany({
  params,
  request,
}: LoaderFunctionArgs): Promise<CompanyPageData> {
  const value = params.placeId ?? ''
  if (!/^\d+$/.test(value) || Number(value) > 2147483647) {
    throw data('Заведение не найдено', { status: 404 })
  }
  const url = new URL(request.url)
  url.searchParams.delete('_routes')
  const page = Number(url.searchParams.get('page') ?? 1)
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    throw data('Неверный номер страницы', { status: 400 })
  }
  const result = await execute({
    schema,
    document: OldCompanyDocument,
    variableValues: {
      place_id: Number(value),
      take: 20,
      skip: (page - 1) * 20,
    },
    contextValue: { knex: knexClient, req: undefined },
  })
  if (result.errors || !result.data) {
    throw data('Не удалось загрузить заведение. Повторите попытку позже.', {
      status: 503,
    })
  }
  const payload = result.data as OldCompanyQuery
  if (!payload.oldCompany) {
    throw data('Заведение не найдено', { status: 404 })
  }
  if (!isCompanyCanonicalPath(url.pathname, payload.oldCompany.uri)) {
    throw redirect(`${payload.oldCompany.uri}${url.search}`, 301)
  }
  if (page > Math.max(1, Math.ceil(payload.oldCompany.beersCount / 20))) {
    throw data('Страница ассортимента не найдена', { status: 404 })
  }
  const company = payload.oldCompany
  return {
    ...payload,
    presentation: {
      html: renderContent(
        company.content,
        company.description || '',
        company.uri,
      ),
      image: imageUrl(company.image),
      gallery: galleryImages(company.gallery),
      sections: await companyExtras(
        company.id,
        Number(value),
        url.searchParams,
      ),
    },
  }
}
