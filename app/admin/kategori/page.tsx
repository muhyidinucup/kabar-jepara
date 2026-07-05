import { createClient } from '@/lib/supabase/server'
import { CategoryList } from './category-list'
import { CategoryForm } from './category-form'
import { Button } from '@/components/ui/button'
import { Plus, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic' // Force refresh setiap kali halaman dibuka

export default async function KategoriPage() {
  const supabase = await createClient()

  // Query langsung ke tabel categories (lebih reliable daripada view)
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      description,
      is_default,
      created_at,
      articles(count)
    `)
    .order('name')

  // Transform data untuk match dengan tipe CategoryList
  const categoriesWithCount = categories?.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    article_count: cat.articles?.[0]?.count || 0,
  })) || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tag className="w-8 h-8" />
            Kelola Kategori
          </h1>
          <p className="text-gray-600 mt-1">
            Tambah, edit, atau hapus kategori berita
          </p>
        </div>
        
        <CategoryForm mode="create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </CategoryForm>
      </div>

      {/* List Kategori */}
      <CategoryList categories={categoriesWithCount} />
    </div>
  )
}