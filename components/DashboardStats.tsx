'use client'

import { FiTrendingUp, FiDatabase, FiClock, FiCheckCircle } from 'react-icons/fi'
import { BeasiswaData } from '@/types/beasiswa'

interface DashboardStatsProps {
  data: BeasiswaData[]
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const totalBeasiswa = data.length

  const byCategory = data.reduce((acc, item) => {
    acc[item.kategori] = (acc[item.kategori] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const lastUpdate = data.length > 0 ? data[0].tanggal_update : null

  const stats = [
    {
      name: 'Total Beasiswa',
      value: totalBeasiswa,
      icon: FiDatabase,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Kategori Aktif',
      value: Object.keys(byCategory).length,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Update Terakhir',
      value: lastUpdate ? new Date(lastUpdate).toLocaleDateString('id-ID') : 'Belum ada',
      icon: FiClock,
      color: 'bg-yellow-500',
      change: 'Real-time',
      changeType: 'neutral'
    },
    {
      name: 'Status Sistem',
      value: 'Aktif',
      icon: FiCheckCircle,
      color: 'bg-green-500',
      change: 'Online',
      changeType: 'increase'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' :
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 