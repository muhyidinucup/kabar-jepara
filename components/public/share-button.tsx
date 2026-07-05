'use client'

import { Share2 } from 'lucide-react'

export function ShareButton({ title, url }: { title: string; url: string }) {
  const handleShare = async () => {
    // Cek apakah browser support Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        })
      } catch (error) {
        // User cancel atau error, tidak perlu di-handle
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy ke clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link berhasil disalin ke clipboard!')
      } catch (error) {
        alert('Gagal menyalin link')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 hover:text-blue-600 transition"
    >
      <Share2 className="w-4 h-4" />
      Bagikan
    </button>
  )
}