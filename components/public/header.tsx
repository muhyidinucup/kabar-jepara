import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './mobile-menu'

export async function PublicHeader() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" role="banner">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Selalu di kiri */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-4 lg:mr-8">
            <span className="text-3xl">📰</span>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Kabar Jepara</h1>
              <p className="text-xs text-gray-500 leading-tight">Portal Informasi Publik</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">Kabar Jepara</h1>
            </div>
          </Link>

          {/* Desktop: Navigation Menu - Tengah */}
          <nav className="hidden lg:flex items-center gap-1 flex-1" role="navigation" aria-label="Menu utama">
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded transition"
            >
              Beranda
            </Link>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded transition whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button - Di KANAN */}
          <MobileMenu categories={categories || []} />
        </div>
      </div>

      {/* Mobile: Horizontal Scroll Categories - Quick Access */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
            <Link 
              href="/" 
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition"
            >
              Beranda
            </Link>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}