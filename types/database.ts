export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Article = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  category_id: number | null
  author_id: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ArticleWithCategory = Article & {
  category_name: string | null
  category_slug: string | null
}