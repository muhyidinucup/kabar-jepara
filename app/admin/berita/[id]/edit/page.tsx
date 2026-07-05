'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TipTapEditor } from '@/components/tiptap-editor'
import { ImageUpload } from '@/components/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, ArrowLeft, Rocket } from 'lucide-react'
import { getArticle, updateArticle, uploadImage } from '../../actions'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'

type Category = {
  id: number
  name: string
  slug: string
}

type ArticleData = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  status: 'draft' | 'published'
  category_id: number | null
  categories: Category | null
}

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const slug = generateSlug(title)

  // Fetch article data on mount
  useEffect(() => {
    const fetchData = async () => {
      const { id: articleId } = await params
      
      // Fetch article
      const result = await getArticle(parseInt(articleId))
      
      if (!result.success || !result.data) {
        toast.error('Berita tidak ditemukan')
        router.push('/admin/berita')
        return
      }

      const article = result.data as unknown as ArticleData
      
      setId(article.id)
      setTitle(article.title)
      setContent(article.content)
      setExcerpt(article.excerpt || '')
      setImageUrl(article.image_url || '')
      setCategoryId(article.category_id?.toString() || '')
      setStatus(article.status)

      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      setCategories(cats || [])
      
      setLoading(false)
    }

    fetchData()
  }, [params])

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.url!
  }

  const handleSubmit = (newStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Judul berita wajib diisi')
      return
    }
    if (!content.trim()) {
      toast.error('Konten berita wajib diisi')
      return
    }
    if (!id) {
      toast.error('Data berita tidak valid')
      return
    }

    const formData = new FormData()
    formData.append('id', id.toString())
    formData.append('title', title)
    formData.append('content', content)
    formData.append('excerpt', excerpt)
    formData.append('image_url', imageUrl)
    formData.append('category_id', categoryId)
    formData.append('status', newStatus)

    startTransition(async () => {
      const result = await updateArticle(formData)

      if (result.success) {
        toast.success(
          newStatus === 'published'
            ? 'Berita berhasil diupdate dan dipublish!'
            : 'Berita berhasil diupdate'
        )
        router.push('/admin/berita')
        router.refresh()
      } else {
        toast.error(result.error || 'Gagal mengupdate berita')
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/berita')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Berita
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Edit Berita</h1>
        <p className="text-gray-600 mt-1">Update artikel yang sudah ada</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Label>Status Saat Ini:</Label>
          {status === 'published' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Draft
            </span>
          )}
        </div>

        {/* Judul */}
        <div className="space-y-2">
          <Label htmlFor="title">Judul Berita</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Festival Tenun Ikat Jepara 2026 Pecahkan Rekor"
            disabled={isPending}
          />
          {slug && (
            <p className="text-xs text-gray-500">
              Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded">/berita/{slug}</code>
            </p>
          )}
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gambar Utama */}
        <div className="space-y-2">
          <Label>Gambar Utama</Label>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            onUpload={handleImageUpload}
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Ringkasan singkat 1-2 kalimat untuk tampil di card berita..."
            rows={3}
            disabled={isPending}
          />
          <p className="text-xs text-gray-500">
            Digunakan untuk preview di card berita dan SEO
          </p>
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <Label>Isi Berita</Label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan sebagai Draft
          </Button>

          <Button
            onClick={() => handleSubmit('published')}
            disabled={isPending || !title || !content}
            className="ml-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            {status === 'published' ? 'Update & Publish' : 'Publish Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  )
}