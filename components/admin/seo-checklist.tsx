'use client'

import { useMemo } from 'react'
import { CheckCircle, AlertCircle, XCircle, BarChart3 } from 'lucide-react'

interface SeoChecklistProps {
  title: string
  excerpt: string
  imageUrl: string
  categoryId: string
  content: string
}

type CheckStatus = 'pass' | 'warn' | 'fail'

interface CheckItem {
  label: string
  status: CheckStatus
  message: string
}

export function SeoChecklist({ title, excerpt, imageUrl, categoryId, content }: SeoChecklistProps) {
  const checks: CheckItem[] = useMemo(() => {
    // 1. Judul (30-60 karakter)
    const titleLen = title.trim().length
    const titleCheck: CheckItem = titleLen === 0
      ? { label: 'Judul', status: 'fail', message: 'Belum diisi' }
      : titleLen < 30
        ? { label: 'Judul', status: 'warn', message: `Terlalu pendek (${titleLen}/30 min)` }
        : titleLen > 60
          ? { label: 'Judul', status: 'warn', message: `Terlalu panjang (${titleLen}/60 maks)` }
          : { label: 'Judul', status: 'pass', message: `${titleLen} karakter (optimal)` }

    // 2. Excerpt (120-160 karakter)
    const excerptLen = excerpt.trim().length
    const excerptCheck: CheckItem = excerptLen === 0
      ? { label: 'Excerpt', status: 'fail', message: 'Belum diisi' }
      : excerptLen < 120
        ? { label: 'Excerpt', status: 'warn', message: `Terlalu pendek (${excerptLen}/120 min)` }
        : excerptLen > 160
          ? { label: 'Excerpt', status: 'warn', message: `Terlalu panjang (${excerptLen}/160 maks)` }
          : { label: 'Excerpt', status: 'pass', message: `${excerptLen} karakter (optimal)` }

    // 3. Gambar Utama
    const imageCheck: CheckItem = imageUrl
      ? { label: 'Gambar Utama', status: 'pass', message: 'Sudah terpasang' }
      : { label: 'Gambar Utama', status: 'fail', message: 'Belum di-upload' }

    // 4. Kategori
    const categoryCheck: CheckItem = categoryId
      ? { label: 'Kategori', status: 'pass', message: 'Sudah dipilih' }
      : { label: 'Kategori', status: 'fail', message: 'Belum dipilih' }

    // 5. Jumlah Kata Konten (min 300)
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    const wordCount = plainText ? plainText.split(' ').length : 0
    const contentCheck: CheckItem = wordCount === 0
      ? { label: 'Konten', status: 'fail', message: 'Belum diisi' }
      : wordCount < 300
        ? { label: 'Konten', status: 'warn', message: `${wordCount} kata (min. 300)` }
        : { label: 'Konten', status: 'pass', message: `${wordCount} kata` }

    // 6. Heading H2 (minimal 1)
    const h2Count = (content.match(/<h2[\s>]/gi) || []).length
    const h2Check: CheckItem = h2Count === 0
      ? { label: 'Heading H2', status: 'fail', message: 'Belum ada subheading H2' }
      : { label: 'Heading H2', status: 'pass', message: `${h2Count} subheading ditemukan` }

    // 7. Internal Link (minimal 1 link ke /kategori/ atau /berita/)
    const internalLinkCount = (content.match(/href=["'](\/kategori\/|\/berita\/)/gi) || []).length
    const linkCheck: CheckItem = internalLinkCount === 0
      ? { label: 'Internal Link', status: 'warn', message: 'Belum ada link ke berita/kategori lain' }
      : { label: 'Internal Link', status: 'pass', message: `${internalLinkCount} internal link ditemukan` }

    return [titleCheck, excerptCheck, imageCheck, categoryCheck, contentCheck, h2Check, linkCheck]
  }, [title, excerpt, imageUrl, categoryId, content])

  // Hitung skor
  const passed = checks.filter(c => c.status === 'pass').length
  const total = checks.length
  const percentage = Math.round((passed / total) * 100)

  // Warna skor
  const scoreColor = percentage >= 80
    ? 'text-green-600'
    : percentage >= 50
      ? 'text-yellow-600'
      : 'text-red-600'

  const barColor = percentage >= 80
    ? 'bg-green-500'
    : percentage >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500'

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-sm text-gray-900">SEO Checklist</h3>
        <span className={`ml-auto text-xs font-bold ${scoreColor}`}>
          {passed}/{total} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="p-3 space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2 text-xs">
            {check.status === 'pass' && <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />}
            {check.status === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />}
            {check.status === 'fail' && <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />}
            <div className="min-w-0">
              <span className={`font-medium ${
                check.status === 'pass' ? 'text-gray-700' :
                check.status === 'warn' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {check.label}
              </span>
              <span className="text-gray-500 ml-1">— {check.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">
          ⚠️ Checklist ini hanya panduan. Artikel tetap bisa disimpan meskipun belum semua item hijau.
        </p>
      </div>
    </div>
  )
}