'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client' // ✅ Hanya client supabase
import { PreviewHeader } from '@/components/public/preview-header' // ✅ Ganti PublicHeader
import { PublicFooter } from '@/components/public/footer'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, Tag, ArrowLeft, Eye } from 'lucide-react'

type PreviewArticle = {
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  published_at: string
  categories: {
    name: string
    slug: string
  } | null
}

export default function PreviewBeritaPage() {
  const [article, setArticle] = useState<PreviewArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initPreview = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      const data = sessionStorage.getItem('preview-article')
      if (data) {
        try {
          setArticle(JSON.parse(data))
        } catch {
          // Data corrupt
        }
      }
      setIsLoading(false)
    }

    initPreview()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Memuat preview...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tidak Ada Data Preview
          </h2>
          <p className="text-gray-600 mb-6">
            Halaman ini hanya bisa diakses melalui tombol Preview di editor berita.
          </p>
          <Link
            href="/admin/berita/baru"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            ← Kembali ke Editor
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviewHeader />

      {/* Preview Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-700" />
            <p className="text-sm font-medium text-yellow-800">
              Mode Preview — Berita ini belum dipublish
            </p>
          </div>
          <Link
            href="/admin/berita/baru"
            className="text-sm text-yellow-700 hover:text-yellow-900 font-medium underline"
          >
            ← Kembali ke Editor
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/admin/berita/baru"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Editor
        </Link>

        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            {article.categories && (
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full mb-4">
                {article.categories.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </span>
              )}

              {article.categories && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {article.categories.name}
                </span>
              )}
            </div>
          </div>

          {article.image_url && (
            <div className="aspect-video relative bg-gray-100">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {article.excerpt && (
            <div className="px-8 pt-6 pb-2">
              <p className="text-lg text-gray-600 italic border-l-4 border-blue-500 pl-4">
                {article.excerpt}
              </p>
            </div>
          )}

          <div
            className="p-8 prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <div className="mt-8 flex justify-center">
          <Link
            href="/admin/berita/baru"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Editor & Lanjut Menulis
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}