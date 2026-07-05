'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper: generate slug dari nama
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// CREATE: Tambah kategori baru
export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = generateSlug(name)

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Nama kategori wajib diisi' }
  }

  // Cek duplikat slug
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return { success: false, error: 'Kategori dengan nama serupa sudah ada' }
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}

// UPDATE: Edit kategori
export async function updateCategory(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = generateSlug(name)

  if (!id || !name) {
    return { success: false, error: 'Data tidak lengkap' }
  }

  // Cek duplikat slug (kecuali diri sendiri)
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single()

  if (existing) {
    return { success: false, error: 'Kategori dengan nama serupa sudah ada' }
  }

  const { error } = await supabase
    .from('categories')
    .update({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}

// DELETE: Hapus kategori
export async function deleteCategory(id: number) {
  const supabase = await createClient()

  // Cek apakah kategori masih dipakai berita
  const { data: articles, error: countError } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) {
    return { success: false, error: countError.message }
  }

  const articleCount = articles?.length || 0

  if (articleCount > 0) {
    return { 
      success: false, 
      error: `Kategori ini masih dipakai ${articleCount} berita. Pindahkan berita ke kategori lain terlebih dahulu.` 
    }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}