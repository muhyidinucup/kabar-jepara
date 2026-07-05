'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// CREATE: Tambah berita baru
export async function createArticle(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const image_url = formData.get('image_url') as string
  const category_id = formData.get('category_id') as string
  const status = formData.get('status') as 'draft' | 'published'

  if (!title || !content) {
    return { success: false, error: 'Judul dan konten wajib diisi' }
  }

  const slug = generateSlug(title)

  // Cek duplikat slug
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return { success: false, error: 'Berita dengan judul serupa sudah ada' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('articles').insert({
    title: title.trim(),
    slug,
    content,
    excerpt: excerpt?.trim() || null,
    image_url: image_url || null,
    category_id: category_id ? parseInt(category_id) : null,
    author_id: user?.id || null,
    status,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/berita')
  return { success: true }
}

// UPLOAD: Upload gambar ke Supabase Storage
export async function uploadImage(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'File tidak ditemukan' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const { data } = supabase.storage.from('article-images').getPublicUrl(filePath)

  return { success: true, url: data.publicUrl }
}

// DELETE: Hapus berita
export async function deleteArticle(id: number) {
  const supabase = await createClient()

  // Ambil data berita dulu untuk hapus gambar dari storage
  const { data: article } = await supabase
    .from('articles')
    .select('image_url')
    .eq('id', id)
    .single()

  // Hapus gambar dari storage kalau ada
  if (article?.image_url) {
    const urlParts = article.image_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    
    await supabase.storage
      .from('article-images')
      .remove([fileName])
  }

  // Hapus berita dari database
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/berita')
  revalidatePath('/admin')
  return { success: true }
}

// GET: Ambil data berita by ID
export async function getArticle(id: number) {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      status,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: article }
}

// UPDATE: Update berita existing
export async function updateArticle(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const image_url = formData.get('image_url') as string
  const category_id = formData.get('category_id') as string
  const status = formData.get('status') as 'draft' | 'published'

  if (!id || !title || !content) {
    return { success: false, error: 'Data tidak lengkap' }
  }

  const slug = generateSlug(title)

  // Cek duplikat slug (kecuali diri sendiri)
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single()

  if (existing) {
    return { success: false, error: 'Berita dengan judul serupa sudah ada' }
  }

  // Get current article untuk cek apakah status berubah dari draft ke published
  const { data: currentArticle } = await supabase
    .from('articles')
    .select('status, published_at')
    .eq('id', id)
    .single()

  const updateData: any = {
    title: title.trim(),
    slug,
    content,
    excerpt: excerpt?.trim() || null,
    image_url: image_url || null,
    category_id: category_id ? parseInt(category_id) : null,
    status,
  }

  // Set published_at kalau status berubah dari draft ke published
  if (
    status === 'published' && 
    currentArticle?.status === 'draft' && 
    !currentArticle?.published_at
  ) {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/berita')
  revalidatePath('/admin')
  return { success: true }
}