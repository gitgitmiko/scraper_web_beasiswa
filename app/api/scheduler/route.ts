import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utils/logger'

const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL || 'http://localhost:3001'

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${SCHEDULER_SERVICE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.error(`Scheduler service request failed for ${endpoint}:`, error instanceof Error ? error : new Error(String(error)))
    
    // Return fallback data instead of throwing error
    if (endpoint === '/status') {
      return {
        isRunning: false,
        isEnabled: false,
        lastUpdate: null,
        nextUpdate: null,
        isUpdating: false
      }
    }
    
    if (endpoint === '/logs') {
      return { logs: [] }
    }
    
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        const status = await makeRequest('/status')
        return NextResponse.json(status)

      case 'logs':
        const level = searchParams.get('level')
        const limit = searchParams.get('limit')
        const logs = await makeRequest(`/logs?level=${level || ''}&limit=${limit || '100'}`)
        return NextResponse.json(logs)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter. Use: status, logs'
        }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to get scheduler information:', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get scheduler information',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'start':
        const startResult = await makeRequest('/start', { method: 'POST' })
        logger.info('Scheduler started successfully')
        return NextResponse.json(startResult)

      case 'stop':
        const stopResult = await makeRequest('/stop', { method: 'POST' })
        logger.info('Scheduler stopped successfully')
        return NextResponse.json(stopResult)

      case 'execute':
        const executeResult = await makeRequest('/execute', { method: 'POST' })
        logger.info('Manual execution completed successfully')
        return NextResponse.json(executeResult)

      case 'config':
        const configResult = await makeRequest('/config', {
          method: 'PUT',
          body: JSON.stringify(data)
        })
        logger.info('Scheduler config updated successfully', data)
        return NextResponse.json(configResult)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, execute, config'
        }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to execute scheduler action:', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute scheduler action',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 