'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import DashboardStats from '@/components/DashboardStats'
import BeasiswaTable from '@/components/BeasiswaTable'
import MonitoringPanelSimple from '@/components/MonitoringPanelSimple'
import { BeasiswaData } from '@/types/beasiswa'
import { FiGlobe, FiUserPlus, FiExternalLink, FiCalendar } from 'react-icons/fi'

export default function Home() {
  const [beasiswaData, setBeasiswaData] = useState<BeasiswaData[]>([])
  const [loading, setLoading] = useState(true)

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
  
  const categories = Array.from(new Set(dataArray.map(item => item.kategori)))

  // Get unique websites for quick access
  const uniqueWebsites = Array.from(new Set(dataArray.map(item => item.website_sumber)))
    .filter(website => website && website.trim() !== '')

  // Get scholarships with registration links
  const scholarshipsWithRegistration = dataArray.filter(item => 
    item.link_pendaftaran && item.link_pendaftaran.trim() !== ''
  ).slice(0, 6)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          showSearch={false}
          showRefresh={false}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-6 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Monitoring dan analisis data beasiswa secara real-time
              </p>
            </div>

            <DashboardStats data={dataArray} />

            {/* Quick Registration Section */}
            <div className="mb-8">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🎯 Daftar Sekarang - Beasiswa Terbaru
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholarshipsWithRegistration.map((scholarship, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {scholarship.nama_beasiswa}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scholarship.kategori === 'SD-SMP-SMA Domestik' ? 'bg-blue-100 text-blue-800' :
                          scholarship.kategori === 'SMP-SMA Internasional/Pertukaran' ? 'bg-green-100 text-green-800' :
                          scholarship.kategori === 'Perguruan Tinggi Dalam Negeri' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {scholarship.kategori.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <FiCalendar className="h-3 w-3 mr-1" />
                        <span>Deadline: {scholarship.deadline}</span>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={scholarship.link_pendaftaran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center space-x-1 transition-colors duration-200"
                        >
                          <FiUserPlus className="h-3 w-3" />
                          <span>Daftar</span>
                        </a>
                        <a
                          href={scholarship.website_sumber}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center transition-colors duration-200"
                          title="Kunjungi Website"
                        >
                          <FiGlobe className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                {scholarshipsWithRegistration.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiUserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Belum ada link pendaftaran tersedia saat ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🚀 Akses Cepat Website Beasiswa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueWebsites.slice(0, 6).map((website, index) => (
                    <a
                      key={index}
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <FiGlobe className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {new URL(website).hostname.replace('www.', '')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {website}
                        </p>
                      </div>
                      <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
                {uniqueWebsites.length > 6 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Dan {uniqueWebsites.length - 6} website beasiswa lainnya tersedia di tabel di bawah
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Data Beasiswa
                    </h2>
                    <div className="flex gap-2">
                      <a
                        href="/beasiswa"
                        className="btn-primary text-sm"
                      >
                        Lihat Semua Data
                      </a>
                    </div>
                  </div>
                  <BeasiswaTable
                    data={dataArray.slice(0, 10)}
                    loading={loading}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <MonitoringPanelSimple />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 