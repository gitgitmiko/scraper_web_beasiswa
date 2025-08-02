'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { BeasiswaData } from '@/types/beasiswa'
import { FiGlobe, FiExternalLink, FiSearch, FiFilter } from 'react-icons/fi'

export default function WebsitesPage() {
  const [beasiswaData, setBeasiswaData] = useState<BeasiswaData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchBeasiswaData()
    
    // Listen for beasiswa update events
    const handleBeasiswaUpdate = () => {
      fetchBeasiswaData()
    }
    
    window.addEventListener('beasiswaUpdated', handleBeasiswaUpdate)
    
    return () => {
      window.removeEventListener('beasiswaUpdated', handleBeasiswaUpdate)
    }
  }, [])

  const fetchBeasiswaData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/beasiswa')
      const result = await response.json()
      
      console.log('API Response:', result)
      
      // Handle API response format
      if (result.success && Array.isArray(result.data)) {
        console.log('Setting data from result.data:', result.data.length, 'items')
        setBeasiswaData(result.data)
      } else if (Array.isArray(result)) {
        // Fallback for direct array response
        console.log('Setting data from direct array:', result.length, 'items')
        setBeasiswaData(result)
      } else {
        console.error('Invalid data format:', result)
        setBeasiswaData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setBeasiswaData([])
    } finally {
      setLoading(false)
    }
  }

  // Get unique websites grouped by category
  const websitesByCategory = beasiswaData.reduce((acc, item) => {
    try {
      if (item.website_sumber && item.website_sumber.trim() !== '') {
        if (!acc[item.kategori]) {
          acc[item.kategori] = []
        }
        
        // Try to parse URL safely
        let hostname = 'Unknown'
        try {
          hostname = new URL(item.website_sumber).hostname.replace('www.', '')
        } catch (urlError) {
          console.warn('Invalid URL:', item.website_sumber)
          hostname = item.website_sumber.replace(/^https?:\/\//, '').replace('www.', '')
        }
        
        if (!acc[item.kategori].find(w => w.website === item.website_sumber)) {
          acc[item.kategori].push({
            website: item.website_sumber,
            name: hostname,
            scholarships: [item.nama_beasiswa]
          })
        } else {
          const existing = acc[item.kategori].find(w => w.website === item.website_sumber)
          if (existing && !existing.scholarships.includes(item.nama_beasiswa)) {
            existing.scholarships.push(item.nama_beasiswa)
          }
        }
      }
    } catch (error) {
      console.error('Error processing website data:', error, item)
    }
    return acc
  }, {} as Record<string, Array<{website: string, name: string, scholarships: string[]}>>)

  const categories = Object.keys(websitesByCategory)
  const filteredCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(cat => cat === selectedCategory)

  const filteredWebsites = filteredCategories.reduce((acc, category) => {
    const websites = websitesByCategory[category].filter(website => 
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.website.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (websites.length > 0) {
      acc[category] = websites
    }
    return acc
  }, {} as Record<string, Array<{website: string, name: string, scholarships: string[]}>>)

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            showSearch={true}
            showRefresh={false}
          />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </main>
        </div>
      </div>
    )
  }

    return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          showSearch={true}
          showRefresh={false}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🌐 Website Beasiswa
              </h1>
              <p className="text-gray-600">
                Akses langsung ke website resmi beasiswa untuk informasi lengkap dan pendaftaran
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari website beasiswa..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiFilter className="h-5 w-5 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field w-auto"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Websites by Category */}
            <div className="space-y-6">
              {Object.keys(filteredWebsites).length === 0 ? (
                <div className="card">
                  <div className="text-center py-12">
                    <FiGlobe className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {beasiswaData.length === 0 ? 'Tidak ada data beasiswa' : 'Tidak ada website ditemukan'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {beasiswaData.length === 0 
                        ? 'Data beasiswa sedang dimuat atau belum tersedia.' 
                        : 'Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.'
                      }
                    </p>
                    {beasiswaData.length > 0 && (
                      <div className="mt-4 text-xs text-gray-400">
                        Debug: {beasiswaData.length} data beasiswa tersedia
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                Object.entries(filteredWebsites).map(([category, websites]) => (
                  <div key={category} className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {websites.map((website, index) => (
                        <a
                          key={index}
                          href={website.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="flex items-start space-x-3">
                            <FiGlobe className="h-6 w-6 text-blue-600 group-hover:text-blue-700 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {website.name}
                              </h3>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {website.website}
                              </p>
                              <p className="text-xs text-blue-600 mt-2">
                                {website.scholarships.length} beasiswa tersedia
                              </p>
                            </div>
                            <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Statistik Website
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.keys(websitesByCategory).length}
                    </div>
                    <div className="text-sm text-gray-600">Kategori</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(websitesByCategory).flat().length}
                    </div>
                    <div className="text-sm text-gray-600">Website Unik</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {beasiswaData.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Beasiswa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 