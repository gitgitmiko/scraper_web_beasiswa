'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react'
import { clientLogger } from '@/utils/logger-client'

interface MonitoringState {
  isUpdating: boolean
  lastUpdate: string | null
  nextUpdate: string | null
  error: string | null
  isLoading: boolean
  logs: string[]
  showLogs: boolean
}

type MonitoringAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATUS'; payload: Partial<MonitoringState> }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'RESET_ERROR' }
  | { type: 'SET_LOGS'; payload: string[] }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'TOGGLE_LOGS'; payload: boolean }
  | { type: 'CLEAR_LOGS' }

const initialState: MonitoringState = {
  isUpdating: false,
  lastUpdate: null,
  nextUpdate: null,
  error: null,
  isLoading: true,
  logs: [],
  showLogs: true
}

function monitoringReducer(state: MonitoringState, action: MonitoringAction): MonitoringState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_STATUS':
      // Always update with new data and reset loading state
      return { ...state, ...action.payload, isLoading: false, error: null }
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload }
    case 'RESET_ERROR':
      return { ...state, error: null }
    case 'SET_LOGS':
      return { ...state, logs: action.payload }
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] }
    case 'TOGGLE_LOGS':
      return { ...state, showLogs: action.payload }
    case 'CLEAR_LOGS':
      return { ...state, logs: [] }
    default:
      return state
  }
}

interface MonitoringContextType {
  state: MonitoringState
  fetchStatus: () => Promise<void>
  startManualUpdate: () => Promise<void>
  clearError: () => void
  fetchLogs: () => Promise<void>
  toggleLogs: () => void
  clearLogs: () => void
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined)

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(monitoringReducer, initialState)
  const [isPollingLogs, setIsPollingLogs] = useState(false)
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStatus = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: true })
      }
      
      const response = await fetch('/api/scheduler?action=status')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const wasUpdating = state.isUpdating
      const isNowUpdating = data.isUpdating
      
      dispatch({
        type: 'SET_STATUS',
        payload: {
          isUpdating: isNowUpdating,
          lastUpdate: data.lastUpdate,
          nextUpdate: data.nextUpdate
        }
      })
      
      // Start polling logs when scraping starts (only if not already polling)
      if (!wasUpdating && isNowUpdating && !isPollingLogs) {
        console.log('🔄 Scraping started, beginning log polling...')
        setIsPollingLogs(true)
        
        // Clear any existing intervals
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
        }
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current)
          statusIntervalRef.current = null
        }
        
        // Start polling for logs and status every 3 seconds during scraping
        logIntervalRef.current = setInterval(async () => {
          try {
            // Check if scraping is still running
            const statusResponse = await fetch('/api/scheduler?action=status')
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              if (!statusData.isUpdating) {
                // Scraping has ended, stop polling
                console.log('🔄 Scraping ended, stopping log polling...')
                if (logIntervalRef.current) {
                  clearInterval(logIntervalRef.current)
                  logIntervalRef.current = null
                }
                setIsPollingLogs(false)
                dispatch({ type: 'SET_UPDATING', payload: false })
                return
              }
            }
            
            // Fetch logs
            const logResponse = await fetch('/api/logs?limit=50')
            if (logResponse.ok) {
              const logData = await logResponse.json()
              if (logData.success && Array.isArray(logData.logs)) {
                const logMessages = logData.logs.map((log: any) => {
                  const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : ''
                  return `[${timestamp}] ${log.message}`
                })
                dispatch({ type: 'SET_LOGS', payload: logMessages })
              }
            }
          } catch (error) {
            clientLogger.error('Failed to fetch logs during polling:', error instanceof Error ? error : new Error(String(error)))
          }
        }, 3000) // Poll logs and status every 3 seconds during scraping
        
        // Clear interval after 5 minutes to prevent memory leaks
        setTimeout(() => {
          if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current)
            logIntervalRef.current = null
          }
          setIsPollingLogs(false)
        }, 5 * 60 * 1000)
      }
      
      // Stop polling when scraping ends
      if (wasUpdating && !isNowUpdating && isPollingLogs) {
        console.log('🔄 Scraping ended, stopping log polling...')
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
          logIntervalRef.current = null
        }
        setIsPollingLogs(false)
        
        // Restart normal status polling
        if (!statusIntervalRef.current) {
          statusIntervalRef.current = setInterval(() => fetchStatus(false), 60000) // Update every 60 seconds (1 minute)
        }
      }
      
      // Only log on initial load or when there's a significant change
      if (showLoading) {
        clientLogger.info('Scheduler status fetched successfully', data)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch status'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      clientLogger.error('Failed to fetch scheduler status:', error instanceof Error ? error : undefined)
    } finally {
      // Always reset loading state after fetch completes
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [state.isUpdating])



  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?limit=50')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.logs)) {
        // Transform logs to display format with timestamp
        const logMessages = data.logs.map((log: any) => {
          const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : ''
          return `[${timestamp}] ${log.message}`
        })
        dispatch({ type: 'SET_LOGS', payload: logMessages })
      }
    } catch (error) {
      clientLogger.error('Failed to fetch logs:', error instanceof Error ? error : new Error(String(error)))
    }
  }, [])

  const startManualUpdate = useCallback(async () => {
    try {
      dispatch({ type: 'RESET_ERROR' })
      dispatch({ type: 'SET_UPDATING', payload: true }) // Immediately disable button
      dispatch({ type: 'CLEAR_LOGS' }) // Clear previous logs
      dispatch({ type: 'TOGGLE_LOGS', payload: true }) // Show logs panel
      
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute' })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      clientLogger.info('Manual update started successfully', data)
      
      // Start polling logs immediately after manual update
      if (!isPollingLogs) {
        console.log('🔄 Manual update started, beginning log polling immediately...')
        setIsPollingLogs(true)
        
        // Clear any existing interval
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
        }
        
        // Start polling for logs immediately
        logIntervalRef.current = setInterval(async () => {
          try {
            // Check if scraping is still running
            const statusResponse = await fetch('/api/scheduler?action=status')
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              if (!statusData.isUpdating) {
                // Scraping has ended, stop polling
                console.log('🔄 Scraping ended, stopping log polling...')
                if (logIntervalRef.current) {
                  clearInterval(logIntervalRef.current)
                  logIntervalRef.current = null
                }
                setIsPollingLogs(false)
                dispatch({ type: 'SET_UPDATING', payload: false })
                return
              }
            }
            
            // Fetch logs
            const logResponse = await fetch('/api/logs?limit=50')
            if (logResponse.ok) {
              const logData = await logResponse.json()
              if (logData.success && Array.isArray(logData.logs)) {
                const logMessages = logData.logs.map((log: any) => {
                  const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : ''
                  return `[${timestamp}] ${log.message}`
                })
                dispatch({ type: 'SET_LOGS', payload: logMessages })
              }
            }
          } catch (error) {
            clientLogger.error('Failed to fetch logs during polling:', error instanceof Error ? error : new Error(String(error)))
          }
        }, 3000) // Poll logs every 3 seconds during scraping
        
        // Clear interval after 5 minutes to prevent memory leaks
        setTimeout(() => {
          if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current)
            logIntervalRef.current = null
          }
          setIsPollingLogs(false)
        }, 5 * 60 * 1000)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start manual update'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      dispatch({ type: 'SET_UPDATING', payload: false })
      clientLogger.error('Failed to start manual update:', error instanceof Error ? error : new Error(String(error)))
    }
  }, [isPollingLogs])

  const clearError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' })
  }, [])

  const toggleLogs = useCallback(() => {
    dispatch({ type: 'TOGGLE_LOGS', payload: !state.showLogs })
  }, [state.showLogs])

  const clearLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' })
      if (response.ok) {
        dispatch({ type: 'CLEAR_LOGS' })
        clientLogger.info('Logs cleared successfully')
      }
    } catch (error) {
      clientLogger.error('Failed to clear logs:', error instanceof Error ? error : new Error(String(error)))
    }
  }, [])

  // Initial fetch and periodic updates
  useEffect(() => {
    // Initial fetch with loading indicator
    fetchStatus(true)
    
    // Fetch logs on initial load if there are any
    const fetchInitialLogs = async () => {
      try {
        const response = await fetch('/api/logs?limit=50')
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
            const logMessages = data.logs.map((log: any) => {
              const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : ''
              return `[${timestamp}] ${log.message}`
            })
            dispatch({ type: 'SET_LOGS', payload: logMessages })
            dispatch({ type: 'TOGGLE_LOGS', payload: true }) // Show logs panel
          }
        }
      } catch (error) {
        clientLogger.error('Failed to fetch initial logs:', error instanceof Error ? error : new Error(String(error)))
      }
    }
    
    fetchInitialLogs()
    
    // Set up periodic status updates (normal frequency when not scraping)
    statusIntervalRef.current = setInterval(() => fetchStatus(false), 60000) // Update every 60 seconds (1 minute)
    
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
      // Clear any active log polling
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current)
        logIntervalRef.current = null
      }
    }
  }, [fetchStatus])

  const value: MonitoringContextType = {
    state,
    fetchStatus,
    startManualUpdate,
    clearError,
    fetchLogs,
    toggleLogs,
    clearLogs
  }

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  )
}

export function useMonitoring() {
  const context = useContext(MonitoringContext)
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider')
  }
  return context
} 