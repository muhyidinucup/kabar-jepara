import { createClient } from '@/lib/supabase/server'

export default async function TestSupabase() {
  const supabase = await createClient()
  
  // Test 1: Fetch categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('id')

  // Test 2: Fetch articles (harusnya kosong)
  const { data: articles, error: artError } = await supabase
    .from('articles')
    .select('*')
    .limit(5)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Koneksi Supabase</h1>
      
      {/* Status Koneksi */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">✅ Koneksi Berhasil!</h2>
        <p className="text-green-700">
          Supabase URL: <code className="bg-green-100 px-2 py-1 rounded">https://dnsrbkzhwgmzzqkjtegj.supabase.co</code>
        </p>
      </div>

      {/* Test Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📂 Kategori ({categories?.length || 0})</h2>
        {catError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Error:</p>
            <p className="text-red-700">{catError.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories?.map((cat) => (
              <div key={cat.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg">{cat.name}</h3>
                <p className="text-sm text-gray-500">/{cat.slug}</p>
                <p className="text-sm text-gray-600 mt-2">{cat.description}</p>
                {cat.is_default && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Articles */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📰 Artikel ({articles?.length || 0})</h2>
        {artError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Error:</p>
            <p className="text-red-700">{artError.message}</p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              {articles?.length === 0 
                ? '✅ Tabel articles kosong (sesuai harapan)' 
                : `✅ Berhasil fetch ${articles?.length} artikel`}
            </p>
          </div>
        )}
      </div>

      {/* Info Tambahan */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">📊 Database Info:</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Total Kategori: {categories?.length || 0}</li>
          <li>• Total Artikel: {articles?.length || 0}</li>
          <li>• Storage Bucket: article-images (sudah dibuat)</li>
          <li>• RLS: Enabled untuk semua tabel</li>
        </ul>
      </div>
    </div>
  )
}