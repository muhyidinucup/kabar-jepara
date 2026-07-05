import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Category = {
  name: string
  slug: string
}

type Article = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  published_at: string | null
  categories: Category | null
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch berita terbaru
  const { data: articles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      published_at,
      categories (
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  const articlesData = (articles || []) as unknown as Article[]
  const latestArticle = articlesData[0]
  const otherArticles = articlesData.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero: Berita Utama */}
        {latestArticle && (
          <Link href={`/berita/${latestArticle.slug}`} className="block mb-12">
            <div className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition group">
              {/* FOTO DI ATAS */}
              {latestArticle.image_url && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={latestArticle.image_url}
                    alt={latestArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              )}
              
              {/* JUDUL DI BAWAH */}
              <div className="p-6">
                {latestArticle.categories && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full mb-3">
                    {latestArticle.categories.name}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {latestArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {/* FIX: Tambah conditional rendering untuk published_at */}
                  {latestArticle.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(latestArticle.published_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid Berita Lainnya */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Berita Terbaru</h2>
            <Link
              href="/semua-berita"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {otherArticles.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Belum ada berita</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/berita/${article.slug}`} className="block group">
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
        {article.image_url && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
        )}
        
        <div className="p-5">
          {article.categories && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded mb-3">
              {article.categories.name}
            </span>
          )}
          
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* FIX: Tambah conditional rendering untuk published_at */}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}