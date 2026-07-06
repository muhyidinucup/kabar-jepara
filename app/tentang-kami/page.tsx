import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Newspaper, Users, Target, Award } from 'lucide-react'

export const metadata = {
  title: 'Tentang Kami - Kabar Jepara',
  description: 'Mengenal lebih dekat portal berita lokal Kabupaten Jepara',
}

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6">
            <Newspaper className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tentang Kabar Jepara
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Portal berita lokal terpercaya yang menyajikan informasi terkini seputar Kabupaten Jepara dan sekitarnya.
          </p>
        </div>

        {/* Visi Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Visi</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Menjadi sumber informasi utama yang akurat, berimbang, dan terpercaya bagi masyarakat Jepara, serta berkontribusi dalam membangun kesadaran publik yang kritis dan informatif.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Misi</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Menyajikan berita faktual dan terverifikasi secara cepat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Mengangkat potensi lokal, budaya, dan UMKM Jepara</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Memberikan ruang aspirasi bagi seluruh lapisan masyarakat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Menjaga independensi dan integritas jurnalistik</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Cerita Kami */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cerita Kami</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              <strong>Kabar Jepara</strong> hadir sebagai jawaban atas kebutuhan masyarakat akan informasi lokal yang cepat, akurat, dan mudah diakses. Didirikan pada tahun 2026, kami berkomitmen untuk menjadi jembatan informasi antara pemerintah, pelaku usaha, dan masyarakat Jepara.
            </p>
            <p>
              Tim redaksi kami terdiri dari jurnalis berpengalaman yang memahami dinamika lokal Jepara. Kami percaya bahwa setiap cerita di Jepara layak didengar — mulai dari pencapaian UMKM mebel ukir yang menembus pasar internasional, kegiatan budaya tradisional, hingga program-program kesehatan dan pendidikan yang berdampak langsung pada kehidupan warga.
            </p>
            <p>
              Dengan teknologi digital terkini, Kabar Jepara dapat diakses kapan saja dan di mana saja melalui website responsif yang ramah perangkat mobile. Kami terus berinovasi untuk memberikan pengalaman membaca berita yang nyaman dan informatif bagi seluruh pembaca setia.
            </p>
          </div>
        </div>

        {/* Tim */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tim Redaksi</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Tim kami terdiri dari profesional yang berdedikasi tinggi terhadap jurnalisme berkualitas dan pelayanan informasi publik.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { role: 'Pemimpin Redaksi', name: 'Redaksi Kabar Jepara' },
              { role: 'Editor Pelaksana', name: 'Tim Editorial' },
              { role: 'Jurnalis Lapangan', name: 'Tim Reporter' },
            ].map((member, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}