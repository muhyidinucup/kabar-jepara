import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { SearchForm } from '@/components/public/search-form'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Category = {
  id: number
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
  categories: {
    name: string
    slug: string
  } | null
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = (params.q as string) || ''
  const categorySlug = (params.category as string) || ''

  const supabase = await createClient()

  // Fetch semua kategori untuk filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const categoriesData = (categories || []) as unknown as Category[]

  // Build query untuk search
  let articlesQuery = supabase
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

  // Filter by search query (kalau ada)
  if (query) {
    articlesQuery = articlesQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
  }

  // Filter by category (kalau ada)
  if (categorySlug) {
    const category = categoriesData.find(cat => cat.slug === categorySlug)
    if (category) {
      articlesQuery = articlesQuery.eq('category_id', category.id)
    }
  }

  const { data: articles } = await articlesQuery.limit(20)
  const articlesData = (articles || []) as unknown as Article[]

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Search */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Cari Berita
            </h1>
          </div>

          {/* Search Form (Client Component) */}
          <SearchForm query={query} categorySlug={categorySlug} categories={categoriesData} />
        </div>

        {/* Results Info */}
        {query && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              {articlesData.length > 0 ? (
                <>
                  Ditemukan <strong>{articlesData.length}</strong> hasil untuk{' '}
                  <strong className="text-blue-600">&quot;{query}&quot;</strong>
                  {categorySlug && (
                    <>
                      {' '}dalam kategori{' '}
                      <strong className="text-blue-600">
                        {categoriesData.find(c => c.slug === categorySlug)?.name}
                      </strong>
                    </>
                  )}
                </>
              ) : (
                <>
                  Tidak ada hasil untuk <strong className="text-blue-600">&quot;{query}&quot;</strong>
                  {categorySlug && (
                    <>
                      {' '}dalam kategori{' '}
                      <strong className="text-blue-600">
                        {categoriesData.find(c => c.slug === categorySlug)?.name}
                      </strong>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Results Grid */}
        {articlesData.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesData.map((article) => (
              <ArticleCard key={article.id} article={article} query={query} />
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

// Empty State Component
function EmptyState({ query }: { query: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {query ? 'Tidak ada hasil ditemukan' : 'Mulai mencari berita'}
      </h2>
      <p className="text-gray-600 mb-6">
        {query
          ? 'Coba kata kunci lain atau ubah filter kategori'
          : 'Ketik kata kunci di kotak pencarian untuk menemukan berita'}
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  )
}

// Article Card Component with Highlight
function ArticleCard({ article, query }: { article: Article; query: string }) {
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
            {query ? highlightText(article.title, query) : article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {query ? highlightText(article.excerpt, query) : article.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* FIX: Conditional rendering untuk published_at */}
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

// Helper function untuk highlight kata kunci
function highlightText(text: string, query: string) {
  if (!query) return <>{text}</>
  
  // Escape regex special characters in query to prevent errors
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded text-gray-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}