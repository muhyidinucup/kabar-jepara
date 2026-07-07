import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kabarjepara.web.id'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Ambil semua artikel published
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  // Ambil semua kategori
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  // Halaman statis
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Artikel dynamic
  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${SITE_URL}/berita/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Kategori dynamic
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages, ...categoryPages]
}