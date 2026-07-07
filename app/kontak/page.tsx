import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { generateSeo } from '@/lib/seo'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

// ✅ DYNAMIC METADATA
export const metadata = generateSeo({
  title: 'Hubungi Kami',
  description: 'Sampaikan pertanyaan, saran, atau informasi berita kepada tim Kabar Jepara. Email, telepon, dan alamat redaksi.',
  path: '/kontak',
})

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6">
            <Send className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan, saran, atau informasi berita? Jangan ragu untuk menghubungi tim Kabar Jepara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Kontak */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:redaksi@kabarjepara.web.id" className="text-blue-600 hover:text-blue-700">
                      redaksi@kabarjepara.web.id
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Telepon / WhatsApp</p>
                    <a href="tel:+6281234567890" className="text-blue-600 hover:text-blue-700">
                      +62 812-3456-7890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alamat Redaksi</p>
                    <p className="text-gray-600 text-sm">
                      Jl. Raya Jepara No. 1<br />
                      Kecamatan Jepara, Kabupaten Jepara<br />
                      Jawa Tengah 59411
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Jam Operasional</p>
                    <p className="text-gray-600 text-sm">
                      Senin – Jumat: 08.00 – 17.00 WIB<br />
                      Sabtu: 08.00 – 12.00 WIB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Catatan Penting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">📌 Catatan Penting</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Untuk pengiriman berita/press release, kirimkan ke email redaksi</li>
                <li>• Laporan pengaduan masyarakat akan ditindaklanjuti sesuai prosedur</li>
                <li>• Iklan dan kerjasama bisnis hubungi via email atau WhatsApp</li>
              </ul>
            </div>
          </div>

          {/* Form Kontak (Static Display) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Masukkan nama Anda"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="contoh@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subjek
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Pilih subjek</option>
                  <option value="pertanyaan">Pertanyaan Umum</option>
                  <option value="saran">Saran & Masukan</option>
                  <option value="berita">Pengiriman Berita</option>
                  <option value="kerjasama">Kerjasama / Iklan</option>
                  <option value="pengaduan">Pengaduan Masyarakat</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              <button
                type="button"
                disabled
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim Pesan (Demo)
              </button>

              <p className="text-xs text-gray-500 text-center">
                ⚠️ Formulir ini adalah tampilan demo. Untuk mengirim pesan nyata, silakan hubungi kami via email atau WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}