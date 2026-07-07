import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { ShareButton } from '@/components/public/share-button'
import { generateSeo } from '@/lib/seo'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kabarjepara.web.id'

type Category = {
  id: number
  name: string
  slug: string
}

type Article = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  published_at: string | null
  updated_at: string | null
  categories: Category | null
}

type RelatedArticle = {
  id: number
  title: string
  slug: string
  image_url: string | null
  published_at: string | null
  categories: { name: string } | null
}

// ✅ DYNAMIC METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, image_url, published_at, updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    return { title: 'Berita Tidak Ditemukan | Kabar Jepara' }
  }

  return generateSeo({
    title: article.title,
    description: article.excerpt || 'Baca berita terbaru dari Kabar Jepara',
    path: `/berita/${slug}`,
    image: article.image_url,
    type: 'article',
    publishedTime: article.published_at || undefined,
    modifiedTime: article.updated_at || undefined,
    authors: ['Redaksi Kabar Jepara'],
  })
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch berita by slug
  const { data: article } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      published_at,
      updated_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    notFound()
  }

  // Type assertion untuk article
  const articleData = article as unknown as Article

  // Fetch berita terkait
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      image_url,
      published_at,
      categories (name)
    `)
    .eq('category_id', articleData.categories?.id)
    .eq('status', 'published')
    .neq('id', articleData.id)
    .order('published_at', { ascending: false })
    .limit(3)

  const related = (relatedArticles || []) as unknown as RelatedArticle[]

  // ✅ JSON-LD SCHEMA NewsArticle
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: articleData.title,
    description: articleData.excerpt || '',
    image: articleData.image_url ? [articleData.image_url] : [],
    datePublished: articleData.published_at || new Date().toISOString(),
    dateModified: articleData.updated_at || articleData.published_at || new Date().toISOString(),
    author: [{
      '@type': 'Organization',
      name: 'Redaksi Kabar Jepara',
      url: SITE_URL,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Kabar Jepara',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/berita/${slug}`,
    },
    ...(articleData.categories && {
      articleSection: articleData.categories.name,
    }),
  }

  // ✅ JSON-LD SCHEMA BreadcrumbList (BARU)
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
      ...(articleData.categories
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: articleData.categories.name,
              item: `${SITE_URL}/kategori/${articleData.categories.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: articleData.categories ? 3 : 2,
        name: articleData.title,
        item: `${SITE_URL}/berita/${slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Inject JSON-LD NewsArticle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ✅ Inject JSON-LD BreadcrumbList (BARU) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            {articleData.categories && (
              <Link
                href={`/kategori/${articleData.categories.slug}`}
                className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full mb-4 hover:bg-blue-700 transition"
              >
                {articleData.categories.name}
              </Link>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {articleData.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {articleData.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(articleData.published_at)}
                </span>
              )}
              
              {articleData.categories && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {articleData.categories.name}
                </span>
              )}

              <ShareButton title={articleData.title} url={`/berita/${articleData.slug}`} />
            </div>
          </div>

          {/* Featured Image */}
          {articleData.image_url && (
            <div className="aspect-video relative">
              <img
                src={articleData.image_url}
                alt={articleData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="p-8 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: articleData.content }}
          />
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Berita Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/berita/${rel.slug}`}
                  className="block group"
                >
                  <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                    {rel.image_url && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={rel.image_url}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                        {rel.title}
                      </h3>
                      {rel.published_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(rel.published_at)}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}