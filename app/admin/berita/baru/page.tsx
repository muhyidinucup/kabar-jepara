'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TipTapEditor } from '@/components/tiptap-editor'
import { ImageUpload } from '@/components/image-upload'
import { SeoChecklist } from '@/components/admin/seo-checklist'
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
import { Loader2, Save, Eye, Rocket, AlertCircle, CheckCircle, Info, Link as LinkIcon } from 'lucide-react'
import { createArticle, uploadImage, checkSlugAvailability } from '../actions'
import { toast } from 'sonner'

type Category = {
  id: number
  name: string
  slug: string
}

export default function TulisBeritaPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  // ✅ Slug validation state
  const [slugPreview, setSlugPreview] = useState('')
  const [slugMessage, setSlugMessage] = useState('')
  const [slugWasModified, setSlugWasModified] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)

  // ✅ Helper untuk status excerpt
  const getExcerptStatus = (text: string) => {
    const len = text.length
    if (len === 0) return { color: 'text-gray-400', icon: Info, msg: 'Belum diisi' }
    if (len < 120) return { color: 'text-yellow-600', icon: AlertCircle, msg: 'Terlalu pendek (< 120 karakter)' }
    if (len > 160) return { color: 'text-red-600', icon: AlertCircle, msg: 'Terlalu panjang (> 160 karakter)' }
    return { color: 'text-green-600', icon: CheckCircle, msg: 'Optimal (120-160 karakter)' }
  }

  const excerptStatus = getExcerptStatus(excerpt)

  // ✅ Debounced slug check (500ms setelah user berhenti mengetik)
  const checkSlug = useCallback(async (titleText: string) => {
    if (!titleText.trim()) {
      setSlugPreview('')
      setSlugMessage('')
      setSlugWasModified(false)
      return
    }

    setSlugChecking(true)
    try {
      const result = await checkSlugAvailability(titleText)
      setSlugPreview(result.slug || '')
      setSlugMessage(result.message || '')
      setSlugWasModified(result.wasModified || false)
    } catch {
      setSlugPreview('')
      setSlugMessage('Gagal mengecek slug')
      setSlugWasModified(false)
    } finally {
      setSlugChecking(false)
    }
  }, [])

  // ✅ Trigger slug check dengan debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      checkSlug(title)
    }, 500)

    return () => clearTimeout(timer)
  }, [title, checkSlug])

  // ✅ Auto-save draft ke sessionStorage setiap kali form berubah
  useEffect(() => {
    const draft = { title, content, excerpt, imageUrl, categoryId }
    sessionStorage.setItem('article-draft', JSON.stringify(draft))
  }, [title, content, excerpt, imageUrl, categoryId])

  // ✅ Load draft saat komponen pertama kali mount
  useEffect(() => {
    const saved = sessionStorage.getItem('article-draft')
    if (saved && !title && !content) {
      try {
        const draft = JSON.parse(saved)
        setTitle(draft.title || '')
        setContent(draft.content || '')
        setExcerpt(draft.excerpt || '')
        setImageUrl(draft.imageUrl || '')
        setCategoryId(draft.categoryId || '')
      } catch {
        // ignore corrupt data
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Fetch categories on mount (BUKAN fetch article)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [supabase])

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.url!
  }

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Judul berita wajib diisi')
      return
    }
    if (!content.trim()) {
      toast.error('Konten berita wajib diisi')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('excerpt', excerpt)
    formData.append('image_url', imageUrl)
    formData.append('category_id', categoryId)
    formData.append('status', status)

    startTransition(async () => {
      const result = await createArticle(formData)

      if (result.success) {
        // ✅ Hapus draft setelah berhasil disimpan
        sessionStorage.removeItem('article-draft')

        // ✅ Tampilkan info kalau slug auto-dimodifikasi
        if (result.slug && result.slug !== slugPreview) {
          toast.info(`Slug disesuaikan menjadi: ${result.slug}`)
        }

        toast.success(
          status === 'published'
            ? 'Berita berhasil dipublish!'
            : 'Draft berhasil disimpan'
        )
        router.push('/admin/berita')
        router.refresh()
      } else {
        toast.error(result.error || 'Gagal menyimpan berita')
      }
    })
  }

  // ✅ Preview functionality
  const handlePreview = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Isi judul dan konten terlebih dahulu untuk preview')
      return
    }

    const selectedCategory = categories.find(c => c.id.toString() === categoryId)

    const previewData = {
      title,
      content,
      excerpt,
      image_url: imageUrl,
      published_at: new Date().toISOString(),
      categories: selectedCategory ? {
        name: selectedCategory.name,
        slug: selectedCategory.slug,
      } : null,
    }

    // Simpan ke sessionStorage supaya halaman preview bisa baca
    sessionStorage.setItem('preview-article', JSON.stringify(previewData))

    // Buka preview di tab baru
    window.open('/preview-berita', '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tulis Berita Baru</h1>
        <p className="text-gray-600 mt-1">Buat artikel baru untuk Kabar Jepara</p>
      </div>

      {/* ✅ Layout 2 Kolom: Form + SEO Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form (2/3 lebar) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Judul + Slug Preview */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Berita</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Festival Tenun Ikat Jepara 2026 Pecahkan Rekor"
              disabled={isPending}
            />
            {/* Slug Preview dengan validasi real-time */}
            {title.trim() && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <LinkIcon className="w-3 h-3 text-gray-400" />
                  {slugChecking ? (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengecek slug...
                    </span>
                  ) : (
                    <code className={`bg-gray-100 px-1.5 py-0.5 rounded ${slugWasModified ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                      /berita/{slugPreview || '...'}
                    </code>
                  )}
                </div>
                {slugMessage && !slugChecking && (
                  <p className={`text-xs flex items-start gap-1 ${slugWasModified ? 'text-orange-600' : 'text-green-600'}`}>
                    {slugWasModified ? (
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    )}
                    {slugMessage}
                  </p>
                )}
              </div>
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

          {/* Excerpt + Character Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
              <span className={`text-xs font-medium flex items-center gap-1 ${excerptStatus.color}`}>
                <excerptStatus.icon className="w-3 h-3" />
                {excerpt.length} / 160 karakter
              </span>
            </div>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat 1-2 kalimat untuk tampil di card berita..."
              rows={3}
              disabled={isPending}
              className="resize-none"
            />
            <div className={`text-xs flex items-start gap-1.5 ${excerptStatus.color}`}>
              <excerptStatus.icon className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{excerptStatus.msg}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Digunakan untuk preview di card berita, meta description SEO, dan Open Graph tags.
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
              Simpan Draft
            </Button>

            <Button
              variant="outline"
              disabled={!title || !content}
              onClick={handlePreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
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
              Publish
            </Button>
          </div>
        </div>

        {/* ✅ SEO Checklist Sidebar (1/3 lebar, sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <SeoChecklist
              title={title}
              excerpt={excerpt}
              imageUrl={imageUrl}
              categoryId={categoryId}
              content={content}
            />
          </div>
        </div>
      </div>
    </div>
  )
}