export interface Item {
  id: number
  name: string
  description?: string
  price: number
  stock_level: number
  category?: string
  image_url?: string | null
}
