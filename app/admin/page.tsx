import { createClient } from '@/lib/supabase/server'
import { FileText, Tag, Eye, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch real data
  const { data: categories } = await supabase
    .from('categories')
    .select('id')

  const { data: articles } = await supabase
    .from('articles')
    .select('id')

  const totalCategories = categories?.length || 0
  const totalArticles = articles?.length || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel admin Kabar Jepara</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Berita"
          value={totalArticles.toString()}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Kategori"
          value={totalCategories.toString()}
          icon={Tag}
          color="green"
        />
        <StatCard
          title="Total Views"
          value="0"
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Bulan Ini"
          value="0"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Tulis Berita Baru"
            description="Mulai menulis artikel baru"
            href="/admin/berita/baru"
            emoji="📝"
          />
          <QuickAction
            title="Kelola Kategori"
            description="Tambah atau edit kategori"
            href="/admin/kategori"
            emoji="🏷️"
          />
          <QuickAction
            title="Lihat Semua Berita"
            description="Daftar semua artikel"
            href="/admin/berita"
            emoji="📋"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: string
  icon: any
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function QuickAction({ title, description, href, emoji }: {
  title: string
  description: string
  href: string
  emoji: string
}) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition"
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  )
}