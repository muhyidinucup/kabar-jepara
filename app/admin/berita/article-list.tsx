'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Edit2,
  Trash2,
  Eye,
  Search,
  FileText,
  Loader2,
} from 'lucide-react'
import { deleteArticle } from './actions'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

type Article = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  categories: {
    id: number
    name: string
    slug: string
  } | null
}

export function ArticleList({ articles }: { articles: Article[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('search', searchQuery)
    } else {
      params.delete('search')
    }
    router.push(`/admin/berita?${params.toString()}`)
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus berita "${title}"?\n\nTindakan ini tidak bisa dibatalkan.`)) return

    setDeletingId(id)
    const result = await deleteArticle(id)
    setDeletingId(null)

    if (result.success) {
      toast.success(`Berita "${title}" berhasil dihapus`)
    } else {
      toast.error(result.error || 'Gagal menghapus berita')
    }
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Belum ada berita</p>
        <Link
          href="/admin/berita/baru"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Tulis Berita Pertama
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari judul berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              {/* Judul + Excerpt */}
              <TableCell className="max-w-md">
                <div>
                  <Link
                    href={`/admin/berita/${article.id}/edit`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  {article.excerpt && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </TableCell>

              {/* Kategori */}
              <TableCell>
                {article.categories ? (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {article.categories.name}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Tanpa kategori</span>
                )}
              </TableCell>

              {/* Status Badge */}
              <TableCell className="text-center">
                <StatusBadge status={article.status} />
              </TableCell>

              {/* Tanggal */}
              <TableCell className="text-sm text-gray-600">
                {formatDate(article.status === 'published' && article.published_at
                  ? article.published_at
                  : article.created_at
                )}
              </TableCell>

              {/* Aksi */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {article.status === 'published' && (
                    <a
                      href={`/berita/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Lihat di website"
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </a>
                  )}

                  <Link href={`/admin/berita/${article.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deletingId === article.id}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    {deletingId === article.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        Published
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
      Draft
    </span>
  )
}