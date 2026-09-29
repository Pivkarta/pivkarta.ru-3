export interface BeerRow {
  id: string
  createdAt: Date
  updatedAt: Date
  beer_id: number | null
  num_comments: number | null
  num_photos: number | null
  container: number | null
  bitter: number | null
  type_id: number | null
  is_request: number | null
  created_at: number | null
  name: string | null
  url_name: string | null
  description: string | null
  country: string | null
  image: string | null
  manufacturer: string | null
  region: string | null
  manufacture_years: string | null
  alcohol: string | null
  wort_percent: string | null
  components: string | null
  color: string | null
  rating: number | string | null
  filtered: boolean | number | null
  pasteurized: boolean | number | null
  editor_content: unknown
  gallery: unknown
}
