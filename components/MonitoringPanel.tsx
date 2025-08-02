'use client'

import React from 'react'
import { FiPlay, FiClock, FiActivity } from 'react-icons/fi'
import { useMonitoring } from '@/contexts/MonitoringContext'

function MonitoringPanel() {
  const { state, startManualUpdate, clearError, toggleLogs, clearLogs } = useMonitoring()
  const { isUpdating, error, isLoading, lastUpdate, logs, showLogs } = state
  

  


  const handleManualUpdate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isUpdating) {
      console.log('Update already in progress, ignoring click')
      return
    }
    
    try {
      console.log('Starting manual update...')
      await startManualUpdate()
      console.log('Manual update request sent successfully')
    } catch (error) {
      console.error('Manual update failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Error saat update manual: ' + errorMessage)
    }
  }

  const getStatusColor = () => {
    return isUpdating ? 'text-blue-600' : 'text-green-600'
  }

  const getStatusText = () => {
    return isUpdating ? 'Sedang Berjalan' : 'Siap'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Monitoring Sistem
        </h3>
        <FiActivity className="h-5 w-5 text-gray-400" />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-900">Error</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Loading status...</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status Scraping */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isUpdating ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">Status Scraping</span>
          </div>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Update Terakhir */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FiClock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Update Terakhir</span>
          </div>
          <p className="text-sm text-blue-700">
            {state.lastUpdate ? new Date(state.lastUpdate).toLocaleString('id-ID') : 'Belum ada update'}
          </p>
        </div>

        {/* Update Berikutnya */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FiClock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Update Berikutnya</span>
          </div>
          <p className="text-sm text-green-700">
            {state.nextUpdate ? new Date(state.nextUpdate).toLocaleString('id-ID') : 'Auto update tidak aktif'}
          </p>
        </div>

        {/* Kontrol Manual */}
        <div className="space-y-3">
                     <button
             onClick={handleManualUpdate}
             disabled={isUpdating}
             className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
               isUpdating ? 'opacity-50 cursor-not-allowed' : ''
             }`}
             style={{ minHeight: '40px' }}
           >
             {isUpdating ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 <span>Updating...</span>
               </>
             ) : (
               <>
                 <FiPlay className="h-4 w-4" />
                 <span>Update Manual</span>
               </>
             )}
           </button>


        </div>

        {/* Logs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Log Detail Scraping</h4>
            <div className="flex space-x-2">
              <button
                onClick={toggleLogs}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                {showLogs ? 'Sembunyikan' : 'Tampilkan'}
              </button>
              {showLogs && logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                >
                  Bersihkan
                </button>
              )}
            </div>
          </div>

          {showLogs && (
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  {isUpdating ? 'Menunggu log scraping...' : 'Belum ada log tersedia'}
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {typeof log === 'string' ? log : String(log)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default React.memo(MonitoringPanel) 