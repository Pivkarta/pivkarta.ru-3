export interface UserRow {
  id: string
  createdAt: Date
  updatedAt: Date
  user_id: number | null
  city_id: number | null
  username: string | null
  fullname: string | null
  image: string | null
  photo: string | null
  about: string | null
  www: string | null
  rating: number | string | null
}
