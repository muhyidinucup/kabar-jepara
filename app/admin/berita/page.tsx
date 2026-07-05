import { createClient } from '@/lib/supabase/server'
import { ArticleList } from './article-list'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DaftarBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  const status = (params.status as string) || 'all'
  const search = (params.search as string) || ''

  // Build query
  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      status,
      published_at,
      created_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  // Filter by status
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Filter by search
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data: articles } = await query

  // Stats
  const { count: totalAll } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })

  const { count: totalDraft } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  const { count: totalPublished } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Daftar Berita
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola semua berita yang sudah dibuat
          </p>
        </div>

        <Link href="/admin/berita/baru">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tulis Berita
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Berita"
          value={totalAll || 0}
          color="blue"
          active={status === 'all'}
          href="/admin/berita"
        />
        <StatCard
          label="Published"
          value={totalPublished || 0}
          color="green"
          active={status === 'published'}
          href="/admin/berita?status=published"
        />
        <StatCard
          label="Draft"
          value={totalDraft || 0}
          color="yellow"
          active={status === 'draft'}
          href="/admin/berita?status=draft"
        />
      </div>

      {/* Article List */}
      <ArticleList articles={(articles || []) as any} />
    </div>
  )
}

function StatCard({ label, value, color, active, href }: {
  label: string
  value: number
  color: string
  active: boolean
  href: string
}) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  }

  return (
    <Link href={href}>
      <div
        className={`
          p-4 rounded-lg border-2 transition
          ${active ? colorClasses[color as keyof typeof colorClasses] : 'border-gray-200 bg-white hover:border-gray-300'}
        `}
      >
        <p className="text-sm font-medium opacity-75">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </Link>
  )
}