import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './mobile-menu'
import { NavTier2Item } from './nav-tier2-item'
import { Lock, Search } from 'lucide-react'

export async function PublicHeader() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" role="banner">
      
      {/* =========================================
          TIER 1: Logo (Kiri) + Actions (Kanan)
          ========================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* KIRI: Logo Saja */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <span className="text-3xl transition-transform group-hover:scale-105">📰</span>
            <div className="leading-tight">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Kabar Jepara</h1>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide hidden sm:block">
                Portal Informasi Publik
              </p>
            </div>
          </Link>

          {/* KANAN: Desktop Actions ATAU Mobile Hamburger */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Desktop Only: Search + Login */}
            <div className="hidden lg:flex items-center gap-3">
              <Link 
                href="/search"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
              >
                <Search className="w-4 h-4" />
                <span>Cari Berita</span>
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Login Admin</span>
              </Link>
            </div>

            {/* ✅ Mobile Only: Hamburger Menu di KANAN */}
            <div className="lg:hidden">
              <MobileMenu categories={categories || []} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          TIER 2: LEFT-ALIGNED NAV (Desktop Only)
          ========================================= */}
      <div className="hidden lg:block border-t border-gray-100 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-start gap-0.5 py-0" role="navigation" aria-label="Menu utama">
            <NavTier2Item href="/">Beranda</NavTier2Item>
            
            {categories?.map((cat) => (
              <NavTier2Item key={cat.id} href={`/kategori/${cat.slug}`}>
                {cat.name}
              </NavTier2Item>
            ))}
            
            <div className="w-px h-5 bg-gray-300 mx-1.5 flex-shrink-0" aria-hidden="true" />
            
            <NavTier2Item href="/tentang-kami">Tentang Kami</NavTier2Item>
            <NavTier2Item href="/kontak">Kontak</NavTier2Item>
          </nav>
        </div>
      </div>

      {/* =========================================
          MOBILE QUICK ACCESS (Horizontal Scroll)
          ========================================= */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
            <MobilePill href="/">Beranda</MobilePill>
            {categories?.map((cat) => (
              <MobilePill key={cat.id} href={`/kategori/${cat.slug}`}>
                {cat.name}
              </MobilePill>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

function MobilePill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition whitespace-nowrap"
    >
      {children}
    </Link>
  )
}