'use client'

import React, { useState, useEffect } from 'react'
import { FiDatabase, FiGlobe, FiTrendingUp, FiCalendar, FiMapPin, FiBookOpen, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface BeasiswaData {
  nama_beasiswa: string
  kategori: string
  website_sumber: string
  deskripsi: string
  persyaratan: string
  deadline: string
  link_pendaftaran: string
  tanggal_update: string
}

interface AnalyticsData {
  totalBeasiswa: number
  kategoriStats: { [key: string]: number }
  websiteStats: { [key: string]: number }
  pendidikanStats: { [key: string]: number }
  lokasiStats: { [key: string]: number }
  deadlineStats: {
    aktif: number
    deadline: number
    tidakAdaInfo: number
  }
  trendData: { [key: string]: number }
  recentBeasiswa: BeasiswaData[]
}

// Component definitions
const StatCard = ({ title, value, icon: Icon, color = 'blue' }: { title: string; value: number; icon: any; color?: string }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
)

const BarChart = ({ data, height = 200 }: { data: { [key: string]: number }; height?: number }) => {
  const maxValue = Math.max(...Object.values(data))
  
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center">
          <div className="w-32 text-sm text-gray-600 truncate">{key}</div>
          <div className="flex-1 mx-3">
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 text-sm font-medium text-gray-900 text-right">{value}</div>
        </div>
      ))}
    </div>
  )
}

const PieChart = ({ data, height = 200 }: { data: { [key: string]: number }; height?: number }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <div className="flex-1 text-sm text-gray-600">{key}</div>
          <div className="text-sm font-medium text-gray-900">
            {value} ({((value / total) * 100).toFixed(1)}%)
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/beasiswa')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      const data: BeasiswaData[] = result.data || result || []
      const analytics = processAnalyticsData(data)
      setAnalyticsData(analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (data: BeasiswaData[]): AnalyticsData => {
    const now = new Date()
    
    const kategoriStats: { [key: string]: number } = {}
    const websiteStats: { [key: string]: number } = {}
    const pendidikanStats: { [key: string]: number } = {}
    const lokasiStats: { [key: string]: number } = {}
    let aktifCount = 0
    let deadlineCount = 0
    let tidakAdaInfoCount = 0

    data.forEach(item => {
      // Kategori stats
      kategoriStats[item.kategori] = (kategoriStats[item.kategori] || 0) + 1
      
      // Website stats - extract domain from URL
      try {
        const url = new URL(item.website_sumber)
        const domain = url.hostname.replace('www.', '')
        websiteStats[domain] = (websiteStats[domain] || 0) + 1
      } catch (error) {
        // If URL is invalid, use a fallback
        websiteStats['Unknown'] = (websiteStats['Unknown'] || 0) + 1
      }
      
      // Extract pendidikan level from kategori
      if (item.kategori.includes('SD') || item.kategori.includes('SMP') || item.kategori.includes('SMA')) {
        pendidikanStats['SD/SMP/SMA'] = (pendidikanStats['SD/SMP/SMA'] || 0) + 1
      } else if (item.kategori.includes('Perguruan Tinggi')) {
        pendidikanStats['Perguruan Tinggi'] = (pendidikanStats['Perguruan Tinggi'] || 0) + 1
      } else {
        pendidikanStats['Lainnya'] = (pendidikanStats['Lainnya'] || 0) + 1
      }
      
      // Extract lokasi from kategori
      if (item.kategori.includes('Domestik')) {
        lokasiStats['Indonesia'] = (lokasiStats['Indonesia'] || 0) + 1
      } else if (item.kategori.includes('Internasional') || item.kategori.includes('Luar Negeri')) {
        lokasiStats['Luar Negeri'] = (lokasiStats['Luar Negeri'] || 0) + 1
      } else {
        lokasiStats['Campuran'] = (lokasiStats['Campuran'] || 0) + 1
      }
      
      // Deadline stats
      if (item.deadline && item.deadline !== 'Berjalan terus' && item.deadline !== 'Tergantung program' && item.deadline !== 'Tergantung periode pendaftaran') {
        // Try to parse specific dates
        const deadlineText = item.deadline.toLowerCase()
        if (deadlineText.includes('januari') || deadlineText.includes('februari') || deadlineText.includes('maret') || 
            deadlineText.includes('april') || deadlineText.includes('mei') || deadlineText.includes('juni') ||
            deadlineText.includes('juli') || deadlineText.includes('agustus') || deadlineText.includes('september') ||
            deadlineText.includes('oktober') || deadlineText.includes('november') || deadlineText.includes('desember')) {
          aktifCount++ // Assume future date if month is mentioned
        } else {
          tidakAdaInfoCount++
        }
      } else {
        aktifCount++ // Consider "Berjalan terus" as active
      }
    })

    // Generate trend data (mock data for now)
    const trendData = {
      'Domestik': kategoriStats['Domestik'] || 0,
      'Internasional': kategoriStats['Internasional'] || 0,
      'PT Dalam Negeri': kategoriStats['PT Dalam Negeri'] || 0,
      'PT Luar Negeri': kategoriStats['PT Luar Negeri'] || 0
    }

    // Get recent beasiswa (last 5)
    const recentBeasiswa = data
      .sort((a, b) => {
        try {
          return new Date(b.tanggal_update || Date.now()).getTime() - new Date(a.tanggal_update || Date.now()).getTime()
        } catch (error) {
          return 0
        }
      })
      .slice(0, 5)

    return {
      totalBeasiswa: data.length,
      kategoriStats,
      websiteStats,
      pendidikanStats,
      lokasiStats,
      deadlineStats: {
        aktif: aktifCount,
        deadline: deadlineCount,
        tidakAdaInfo: tidakAdaInfoCount
      },
      trendData,
      recentBeasiswa
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header showSearch={false} showRefresh={false} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header showSearch={false} showRefresh={false} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <FiXCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={fetchAnalyticsData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header showSearch={false} showRefresh={false} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Beasiswa</h1>
              <p className="text-gray-600">Statistik dan analisis data beasiswa yang telah di-scrape</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Beasiswa" 
                value={analyticsData.totalBeasiswa} 
                icon={FiDatabase} 
                color="blue"
              />
              <StatCard 
                title="Website Sumber" 
                value={Object.keys(analyticsData.websiteStats).length} 
                icon={FiGlobe} 
                color="green"
              />
              <StatCard 
                title="Kategori Aktif" 
                value={Object.keys(analyticsData.kategoriStats).length} 
                icon={FiTrendingUp} 
                color="yellow"
              />
              <StatCard 
                title="Beasiswa Aktif" 
                value={analyticsData.deadlineStats.aktif} 
                icon={FiCheckCircle} 
                color="green"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Kategori Distribution */}
              <ChartCard title="Distribusi Kategori Beasiswa">
                <BarChart data={analyticsData.kategoriStats} />
              </ChartCard>

              {/* Website Sources */}
              <ChartCard title="Sumber Website">
                <BarChart data={analyticsData.websiteStats} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Deadline Status */}
              <ChartCard title="Status Deadline">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Aktif</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analyticsData.deadlineStats.aktif}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Deadline</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analyticsData.deadlineStats.deadline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Tidak Ada Info</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analyticsData.deadlineStats.tidakAdaInfo}
                    </span>
                  </div>
                </div>
              </ChartCard>

              {/* Pendidikan Level */}
              <ChartCard title="Tingkat Pendidikan">
                {Object.keys(analyticsData.pendidikanStats).length > 0 ? (
                  <PieChart data={analyticsData.pendidikanStats} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiBookOpen className="h-12 w-12 mx-auto mb-2" />
                    <p>Data tingkat pendidikan belum tersedia</p>
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Lokasi Distribution */}
            {Object.keys(analyticsData.lokasiStats).length > 0 && (
              <ChartCard title="Distribusi Lokasi">
                <BarChart data={analyticsData.lokasiStats} />
              </ChartCard>
            )}

            {/* Recent Updates */}
            <ChartCard title="Update Terbaru">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  Data terakhir diperbarui: {new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Statistik Cepat</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Kategori:</span>
                        <span className="font-medium">{Object.keys(analyticsData.kategoriStats).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Website Sumber:</span>
                        <span className="font-medium">{Object.keys(analyticsData.websiteStats).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beasiswa Aktif:</span>
                        <span className="font-medium text-green-600">{analyticsData.deadlineStats.aktif}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Distribusi Pendidikan</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(analyticsData.pendidikanStats).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Recent Beasiswa */}
            <ChartCard title="Beasiswa Terbaru">
              <div className="space-y-4">
                {analyticsData.recentBeasiswa.map((beasiswa, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{beasiswa.nama_beasiswa}</h4>
                        <p className="text-sm text-gray-600 mb-2">{beasiswa.kategori}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>Deadline: {beasiswa.deadline}</span>
                          <span>Update: {(() => {
                            try {
                              return new Date(beasiswa.tanggal_update || Date.now()).toLocaleDateString('id-ID')
                            } catch (error) {
                              return 'N/A'
                            }
                          })()}</span>
                        </div>
                      </div>
                      <a 
                        href={beasiswa.link_pendaftaran} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lihat Detail →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </main>
      </div>
    </div>
  )
} 