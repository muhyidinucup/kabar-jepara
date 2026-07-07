'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Generate slug dari teks
 * - Lowercase
 * - Hapus karakter non-alfanumerik kecuali spasi dan hyphen
 * - Ganti spasi dengan hyphen
 * - Hapus hyphen berulang
 * - Trim hyphen di awal/akhir
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // ✅ Trim hyphen di awal/akhir
    .trim()
}

/**
 * Cek ketersediaan slug + auto-suffix kalau duplikat
 * Returns slug yang pasti unik
 */
async function getUniqueSlug(
  supabase: any,
  baseSlug: string,
  excludeId?: number
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    let query = supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query

    if (!data || data.length === 0) {
      return slug // ✅ Slug tersedia
    }

    // ❌ Slug sudah dipakai, coba dengan suffix
    suffix++
    slug = `${baseSlug}-${suffix}`

    // Safety limit mencegah infinite loop
    if (suffix > 100) {
      throw new Error('Terlalu banyak slug duplikat. Silakan ubah judul secara manual.')
    }
  }
}

// ✅ CHECK SLUG AVAILABILITY (untuk validasi real-time di frontend)
export async function checkSlugAvailability(title: string, excludeId?: number) {
  const supabase = await createClient()

  if (!title || !title.trim()) {
    return { available: false, slug: '', message: 'Judul kosong' }
  }

  const baseSlug = generateSlug(title)

  if (!baseSlug) {
    return { available: false, slug: '', message: 'Judul tidak menghasilkan slug yang valid' }
  }

  try {
    const uniqueSlug = await getUniqueSlug(supabase, baseSlug, excludeId)
    const isModified = uniqueSlug !== baseSlug

    return {
      available: true,
      slug: uniqueSlug,
      message: isModified
        ? `Slug disesuaikan menjadi "${uniqueSlug}" karena slug asli sudah terpakai`
        : 'Slug tersedia',
      wasModified: isModified,
    }
  } catch (error: any) {
    return { available: false, slug: '', message: error.message }
  }
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

  const baseSlug = generateSlug(title)

  if (!baseSlug) {
    return { success: false, error: 'Judul tidak menghasilkan slug yang valid. Gunakan huruf dan angka.' }
  }

  // ✅ Auto-suffix kalau duplikat (bukan return error)
  const slug = await getUniqueSlug(supabase, baseSlug)

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  const insertData: any = {
    title: title.trim(),
    slug,
    content,
    excerpt: excerpt?.trim() || null,
    image_url: image_url || null,
    category_id: category_id ? parseInt(category_id) : null,
    author_id: user?.id || null,
    status,
  }

  // Set published_at langsung kalau status = published saat create
  if (status === 'published') {
    insertData.published_at = new Date().toISOString()
  }

  const { error } = await supabase.from('articles').insert(insertData)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/berita')
  revalidatePath('/')
  return { success: true, slug }
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
  revalidatePath('/')
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

  const articleId = parseInt(id)

  // ✅ Ambil data artikel saat ini untuk cek status & slug lama
  const { data: currentArticle } = await supabase
    .from('articles')
    .select('status, slug, published_at')
    .eq('id', articleId)
    .single()

  if (!currentArticle) {
    return { success: false, error: 'Berita tidak ditemukan' }
  }

  const updateData: any = {
    title: title.trim(),
    content,
    excerpt: excerpt?.trim() || null,
    image_url: image_url || null,
    category_id: category_id ? parseInt(category_id) : null,
    status,
  }

  // ✅ LOCK SLUG SETELAH PUBLISH
  // Kalau artikel sudah published, JANGAN ubah slug meskipun judul berubah
  if (currentArticle.status === 'published') {
    updateData.slug = currentArticle.slug // Pertahankan slug lama
  } else {
    // Artikel masih draft → boleh regenerate slug dengan auto-suffix
    const baseSlug = generateSlug(title)

    if (!baseSlug) {
      return { success: false, error: 'Judul tidak menghasilkan slug yang valid.' }
    }

    updateData.slug = await getUniqueSlug(supabase, baseSlug, articleId)
  }

  // Set published_at kalau status berubah dari draft ke published
  if (
    status === 'published' &&
    currentArticle.status === 'draft' &&
    !currentArticle.published_at
  ) {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', articleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/berita')
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}