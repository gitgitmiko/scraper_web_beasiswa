'use client'

import { useState } from 'react'
import { FiExternalLink, FiEye, FiDownload, FiGlobe, FiUserPlus } from 'react-icons/fi'
import { BeasiswaData } from '@/types/beasiswa'

interface BeasiswaTableProps {
  data: BeasiswaData[]
  loading: boolean
}

export default function BeasiswaTable({ data, loading }: BeasiswaTableProps) {
  const [selectedItem, setSelectedItem] = useState<BeasiswaData | null>(null)

  const getCategoryColor = (kategori: string) => {
    const colors = {
      'SD-SMP-SMA Domestik': 'bg-blue-100 text-blue-800',
      'SMP-SMA Internasional/Pertukaran': 'bg-green-100 text-green-800',
      'Perguruan Tinggi Dalam Negeri': 'bg-yellow-100 text-yellow-800',
      'Perguruan Tinggi Luar Negeri': 'bg-purple-100 text-purple-800'
    }
    return colors[kategori as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
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
                Update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
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
                  {new Date(item.tanggal_update).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded"
                      title="Lihat Detail"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    
                    {/* Website Beasiswa */}
                    <a
                      href={item.website_sumber}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Kunjungi Website Beasiswa"
                    >
                      <FiGlobe className="h-4 w-4" />
                    </a>
                    
                    {/* Link Pendaftaran */}
                    <a
                      href={item.link_pendaftaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
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

      {/* Modal Detail */}
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
  )
} 