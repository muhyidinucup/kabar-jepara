import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { generateSeo } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Calendar, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kabarjepara.web.id'

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
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

// ✅ DYNAMIC METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return { title: 'Kategori Tidak Ditemukan | Kabar Jepara' }
  }

  return generateSeo({
    title: `Berita ${category.name}`,
    description: category.description || `Kumpulan berita ${category.name} terbaru dan terkini di Kabupaten Jepara`,
    path: `/kategori/${slug}`,
  })
}

export default async function KategoriPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch kategori by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single()

  // Kalau kategori tidak ada, return 404
  if (!category) {
    notFound()
  }

  const categoryData = category as unknown as Category

  // Fetch berita di kategori ini (published only)
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
    .eq('category_id', categoryData.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  const articlesData = (articles || []) as unknown as Article[]

  // ✅ JSON-LD SCHEMA BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryData.name,
        item: `${SITE_URL}/kategori/${categoryData.slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Inject JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Visual */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{categoryData.name}</span>
          </nav>
        </div>

        {/* Header Kategori */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {categoryData.name}
            </h1>
          </div>
          {categoryData.description && (
            <p className="text-gray-600 text-lg">
              {categoryData.description}
            </p>
          )}
        </div>

        {/* Grid Berita */}
        {articlesData.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Belum ada berita di kategori ini</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articlesData.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Info kalau ada lebih dari 12 berita */}
            {articlesData.length === 12 && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Menampilkan 12 berita terbaru
                </p>
              </div>
            )}
          </>
        )}
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