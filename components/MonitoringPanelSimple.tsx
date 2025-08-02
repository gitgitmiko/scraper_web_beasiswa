'use client'

import React, { useState, useEffect } from 'react'
import { FiPlay, FiClock, FiActivity } from 'react-icons/fi'

function MonitoringPanelSimple() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch status only when component mounts
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scheduler?action=status')
      if (response.ok) {
        const data = await response.json()
        setIsUpdating(data.isUpdating || false)
        setLastUpdate(data.lastUpdate || null)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const handleManualUpdate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isUpdating) {
      console.log('Update already in progress, ignoring click')
      return
    }
    
    try {
      console.log('Starting manual update...')
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute' })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      console.log('Manual update request sent successfully')
      
      // Refresh status after a short delay
      setTimeout(() => {
        fetchStatus()
      }, 2000)
      
    } catch (error) {
      console.error('Manual update failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      setIsUpdating(false)
    }
  }

  const clearError = () => {
    setError(null)
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
            {lastUpdate ? new Date(lastUpdate).toLocaleString('id-ID') : 'Belum ada update'}
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

        {/* Link ke Halaman Monitoring */}
        <div className="text-center">
          <a
            href="/monitoring"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Lihat Detail Monitoring →
          </a>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MonitoringPanelSimple) 