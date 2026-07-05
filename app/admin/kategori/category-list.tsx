'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, FileText, Tag as TagIcon } from 'lucide-react'
import { CategoryForm } from './category-form'
import { deleteCategory } from './actions'
import { toast } from 'sonner'

type Category = {
  id: number
  name: string
  slug: string
  article_count: number
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return

    setDeletingId(id)
    const result = await deleteCategory(id)
    setDeletingId(null)

    if (result.success) {
      toast.success(`Kategori "${name}" berhasil dihapus`)
    } else {
      toast.error(result.error || 'Gagal menghapus kategori')
    }
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <TagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Belum ada kategori</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16">#</TableHead>
            <TableHead>Nama Kategori</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-center">Jumlah Berita</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat, index) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium text-gray-500">
                {index + 1}
              </TableCell>
              <TableCell className="font-semibold">{cat.name}</TableCell>
              <TableCell>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  /{cat.slug}
                </code>
              </TableCell>
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <FileText className="w-3 h-3" />
                  {cat.article_count}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <CategoryForm mode="edit" category={cat}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </CategoryForm>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id || cat.article_count > 0}
                    className={cat.article_count > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'}
                    title={cat.article_count > 0 ? `Tidak bisa dihapus: masih dipakai ${cat.article_count} berita` : 'Hapus kategori'}
                  >
                    <Trash2 className="w-4 h-4" />
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