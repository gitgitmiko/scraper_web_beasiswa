'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { BeasiswaData } from '@/types/beasiswa'
import { FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiGrid, FiList, FiDownload, FiGlobe, FiUserPlus, FiCalendar, FiEye } from 'react-icons/fi'

export default function BeasiswaPage() {
  const [beasiswaData, setBeasiswaData] = useState<BeasiswaData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('nama_beasiswa')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<BeasiswaData | null>(null)

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
      
      // Handle API response format
      if (result.success && Array.isArray(result.data)) {
        setBeasiswaData(result.data)
      } else if (Array.isArray(result)) {
        // Fallback for direct array response
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

  // Ensure beasiswaData is an array
  const dataArray = Array.isArray(beasiswaData) ? beasiswaData : []
  
  const filteredData = dataArray.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.kategori === selectedCategory
    const matchesSearch = item.nama_beasiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.persyaratan && item.persyaratan.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortBy as keyof BeasiswaData]
    let bValue: any = b[sortBy as keyof BeasiswaData]

    if (sortBy === 'deadline') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const categories = ['all', ...Array.from(new Set(dataArray.map(item => item.kategori)))]

  const getCategoryColor = (kategori: string) => {
    const colors = {
      'SD-SMP-SMA Domestik': 'bg-blue-100 text-blue-800',
      'SMP-SMA Internasional/Pertukaran': 'bg-green-100 text-green-800',
      'Perguruan Tinggi Dalam Negeri': 'bg-yellow-100 text-yellow-800',
      'Perguruan Tinggi Luar Negeri': 'bg-purple-100 text-purple-800'
    }
    return colors[kategori as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const exportToCSV = () => {
    const headers = ['Nama Beasiswa', 'Kategori', 'Website Sumber', 'Deskripsi', 'Persyaratan', 'Deadline', 'Link Pendaftaran', 'Tanggal Update']
    const csvContent = [
      headers.join(','),
      ...sortedData.map(item => [
        `"${item.nama_beasiswa}"`,
        `"${item.kategori}"`,
        `"${item.website_sumber}"`,
        `"${item.deskripsi}"`,
        `"${item.persyaratan}"`,
        `"${item.deadline}"`,
        `"${item.link_pendaftaran}"`,
        `"${item.tanggal_update}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'beasiswa_data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
                     <Header
             searchTerm=""
             onSearchChange={() => {}}
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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showRefresh={false}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📚 Data Beasiswa
              </h1>
              <p className="text-gray-600">
                Kelola dan eksplorasi data beasiswa dengan fitur pencarian dan filter yang lengkap
              </p>
            </div>

            {/* Controls */}
            <div className="card mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari beasiswa..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FiFilter className="h-5 w-5 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field w-auto"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'Semua Kategori' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FiArrowUp className="h-4 w-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field w-auto"
                    >
                      <option value="nama_beasiswa">Nama Beasiswa</option>
                      <option value="kategori">Kategori</option>
                      <option value="deadline">Deadline</option>
                      <option value="tanggal_update">Update Terakhir</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {sortOrder === 'asc' ? <FiArrowUp className="h-4 w-4" /> : <FiArrowDown className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <FiGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <FiList className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={exportToCSV}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Menampilkan {sortedData.length} dari {dataArray.length} beasiswa
              </p>
            </div>

            {/* Data Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedData.map((item, index) => (
                  <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {item.nama_beasiswa}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getCategoryColor(item.kategori)}`}>
                        {item.kategori.split(' ')[0]}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {item.deskripsi}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <FiCalendar className="h-3 w-3 mr-1" />
                        <span>Deadline: {item.deadline}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiGlobe className="h-3 w-3 mr-1" />
                        <span className="truncate">{new URL(item.website_sumber).hostname.replace('www.', '')}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center space-x-1 transition-colors duration-200"
                      >
                        <FiEye className="h-3 w-3" />
                        <span>Detail</span>
                      </button>
                      <a
                        href={item.website_sumber}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center transition-colors duration-200"
                        title="Kunjungi Website"
                      >
                        <FiGlobe className="h-3 w-3" />
                      </a>
                      <a
                        href={item.link_pendaftaran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center transition-colors duration-200"
                        title="Daftar Sekarang"
                      >
                        <FiUserPlus className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Beasiswa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.nama_beasiswa}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.deskripsi}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.kategori)}`}>
                              {item.kategori}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.deadline}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={item.website_sumber}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800"
                            >
                              {new URL(item.website_sumber).hostname.replace('www.', '')}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Lihat Detail"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <a
                                href={item.website_sumber}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                                title="Kunjungi Website"
                              >
                                <FiGlobe className="h-4 w-4" />
                              </a>
                              <a
                                href={item.link_pendaftaran}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="Daftar Sekarang"
                              >
                                <FiUserPlus className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Detail Beasiswa
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Beasiswa</label>
                        <p className="text-sm text-gray-900">{selectedItem.nama_beasiswa}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                        <p className="text-sm text-gray-900">{selectedItem.kategori}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <p className="text-sm text-gray-900">{selectedItem.deskripsi}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Persyaratan</label>
                        <p className="text-sm text-gray-900">{selectedItem.persyaratan}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Deadline</label>
                        <p className="text-sm text-gray-900">{selectedItem.deadline}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website Sumber</label>
                        <a
                          href={selectedItem.website_sumber}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                        >
                          <FiGlobe className="h-4 w-4" />
                          <span>Kunjungi Website</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="btn-secondary"
                      >
                        Tutup
                      </button>
                      <a
                        href={selectedItem.link_pendaftaran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiUserPlus className="h-4 w-4" />
                        <span>Daftar Sekarang</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 