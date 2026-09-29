export interface PublicLink {
  name: string
  path: string
  description?: string
  image?: string
  mapPath?: string
  authors?: PublicLink[]
  date?: string
}
export interface PublicSection {
  id: string
  title: string
  items: PublicLink[]
  html?: string
  page?: number
  pages?: number
  parameter?: string
}
export interface PublicPageData {
  title: string
  path: string
  canonical?: string
  description: string
  html?: string
  image?: string
  gallery?: string[]
  items: PublicLink[]
  sections: PublicSection[]
  page: number
  pages: number
  query: string
  search?: boolean
  noindex?: boolean
  city?: { name: string; alias: string }
  map?: { lat: number; lng: number; zoom: number; marker?: boolean }
}
