import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📰</span>
              <div>
                <h3 className="text-xl font-bold text-white">Kabar Jepara</h3>
                <p className="text-sm text-gray-400">Portal Informasi Publik</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Menyajikan informasi terkini seputar Jepara dan sekitarnya. Berita terpercaya untuk warga Jepara.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Beranda
                </Link>
              </li>
              <li>
                {/* ✅ FIX: /tentang → /tentang-kami */}
                <Link href="/tentang-kami" className="hover:text-white transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-white transition">
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition">
                  Login Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 Jepara, Jawa Tengah, Indonesia</li>
              <li>📧 info@kabarjepara.web.id</li>
              <li>🌐 kabarjepara.web.id</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2026 Kabar Jepara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}