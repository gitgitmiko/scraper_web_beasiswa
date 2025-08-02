'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import MonitoringPanel from '@/components/MonitoringPanel'
import { MonitoringProvider } from '@/contexts/MonitoringContext'

export default function MonitoringPage() {
  return (
    <MonitoringProvider>
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
                  Monitoring Sistem
                </h1>
                <p className="text-gray-600">
                  Pantau status scraping dan lakukan update manual
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Monitoring Panel */}
                <div className="lg:col-span-3">
                  <MonitoringPanel />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </MonitoringProvider>
  )
} 