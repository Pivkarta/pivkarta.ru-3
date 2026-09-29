export interface CompanyRow {
  id: string
  createdAt: Date
  updatedAt: Date
  place_id: number | null
  city_id: number | null
  num_comments: number | null
  num_photos: number | null
  num_votes: number | null
  is_request: number | null
  name: string | null
  description: string | null
  address: string | null
  website: string | null
  phone: string | null
  work_hours: string | null
  metro: string | null
  url_name: string | null
  image: string | null
  email: string | null
  lng: number | string | null
  lat: number | string | null
  rating_average: number | string | null
  is_bar: boolean | number | null
  is_shop: boolean | number | null
  is_brewery: boolean | number | null
  active: boolean | number | null
  best: boolean | number | null
  wifi: boolean | number | null
  tv: boolean | number | null
  content: unknown
  schedules: unknown
  gallery: unknown
}
