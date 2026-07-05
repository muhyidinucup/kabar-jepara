'use client'

import Link from 'next/link'
import { Newspaper } from 'lucide-react'

export function PreviewHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Kabar Jepara</h1>
              <p className="text-xs text-gray-500 leading-tight">Portal Informasi Publik</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}