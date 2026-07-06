'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavTier2Item({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isActive = href === '/' 
    ? pathname === '/' 
    : pathname.startsWith(href)
  
  return (
    <Link
      href={href}
      className={`
        px-3 py-2.5 text-[13px] font-semibold rounded-md transition-colors whitespace-nowrap relative group
        ${isActive 
          ? 'text-blue-700 bg-blue-50/80' 
          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50/80'
        }
      `}
    >
      {children}
      <span className={`
        absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 transform transition-transform origin-left
        ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
      `} />
    </Link>
  )
}