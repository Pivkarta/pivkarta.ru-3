import type { MetaFunction } from 'react-router'
import { createSeoMeta, unavailableSeoMeta } from '../components/seo/SeoHeaders'
import type { SeoHandle } from '../components/seo/SeoHeaders'
import { MainPage } from '../pages/MainPage'
import { site } from '../components/seo/site'

export const handle: SeoHandle = {
  seo: {
    title: 'Пивная карта — пиво, фотографии и заведения',
    description: site.description,
    path: '/',
  },
}
export const meta: MetaFunction = ({ error }) =>
  error ? unavailableSeoMeta() : createSeoMeta(handle.seo)
export default MainPage
