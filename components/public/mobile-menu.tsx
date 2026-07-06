'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Tag, Search, Info, Mail, Lock } from 'lucide-react'

type Category = {
  id: number
  name: string
  slug: string
}

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu saat route berubah (user klik link)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close menu saat tekan Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Lock body scroll saat menu terbuka
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Helper: cek apakah menu aktif
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Helper class untuk menu item
  const menuItemClass = (href: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition
    ${isActive(href) 
      ? 'bg-blue-50 text-blue-700 font-semibold' 
      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }
  `

  return (
    <>
      {/* Hamburger Button - Di KANAN */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-3 hover:bg-gray-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay - Background gelap */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Menu dari KANAN */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        {/* Header Menu */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📰</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Kabar Jepara</h2>
              <p className="text-xs text-gray-500">Menu Navigasi</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 hover:bg-gray-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Menu Items - Scrollable */}
        <nav 
          className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]"
          role="navigation"
          aria-label="Menu utama"
        >
          {/* Search - Paling atas */}
          <Link
            href="/search"
            onClick={() => setIsOpen(false)}
            className={menuItemClass('/search')}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Cari Berita</span>
          </Link>

          {/* Divider: Navigasi */}
          <div className="pt-3 pb-2 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigasi
            </p>
          </div>

          {/* Home */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={menuItemClass('/')}
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </Link>

          {/* Divider: Kategori Berita */}
          <div className="pt-3 pb-2 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Kategori Berita
            </p>
          </div>

          {/* Categories */}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className={menuItemClass(`/kategori/${cat.slug}`)}
            >
              <Tag className="w-5 h-5" />
              <span>{cat.name}</span>
            </Link>
          ))}

          {/* Divider: Informasi */}
          <div className="pt-3 pb-2 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Informasi
            </p>
          </div>

          {/* ✅ FIX: Tentang Kami - href disesuaikan ke /tentang-kami */}
          <Link
            href="/tentang-kami"
            onClick={() => setIsOpen(false)}
            className={menuItemClass('/tentang-kami')}
          >
            <Info className="w-5 h-5" />
            <span>Tentang Kami</span>
          </Link>

          {/* Kontak */}
          <Link
            href="/kontak"
            onClick={() => setIsOpen(false)}
            className={menuItemClass('/kontak')}
          >
            <Mail className="w-5 h-5" />
            <span>Kontak</span>
          </Link>

          {/* Login Admin */}
          <Link
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            className={`${menuItemClass('/admin/login')} mt-2 border border-gray-200`}
          >
            <Lock className="w-5 h-5" />
            <span>Login Admin</span>
          </Link>
        </nav>
      </div>
    </>
  )
}