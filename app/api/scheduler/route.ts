import { NextRequest, NextResponse } from 'next/server'

const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL || 'https://beasiswa-scheduler.onrender.com'

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${SCHEDULER_SERVICE_URL}${endpoint}`
  console.log(`🔗 Making request to: ${url}`)
  console.log(`🔧 Environment: SCHEDULER_SERVICE_URL = ${process.env.SCHEDULER_SERVICE_URL || 'not set'}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    console.log(`📊 Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `HTTP ${response.status}`
      console.error(`❌ Request failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log(`✅ Request successful:`, data)
    return data
  } catch (error) {
    console.error(`❌ Scheduler service request failed for ${endpoint}:`, error instanceof Error ? error.message : String(error))
    
    // Return fallback data instead of throwing error
    if (endpoint === '/status') {
      console.log(`🔄 Returning fallback status data`)
      return {
        isRunning: false,
        isEnabled: false,
        lastUpdate: null,
        nextUpdate: null,
        isUpdating: false
      }
    }
    
    if (endpoint === '/logs') {
      console.log(`🔄 Returning fallback logs data`)
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
    console.error('Failed to get scheduler information:', error instanceof Error ? error.message : String(error))
    
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
        console.log('Scheduler started successfully')
        return NextResponse.json(startResult)

      case 'stop':
        const stopResult = await makeRequest('/stop', { method: 'POST' })
        console.log('Scheduler stopped successfully')
        return NextResponse.json(stopResult)

      case 'execute':
        const executeResult = await makeRequest('/execute', { method: 'POST' })
        console.log('Manual execution completed successfully')
        return NextResponse.json(executeResult)

      case 'config':
        const configResult = await makeRequest('/config', {
          method: 'PUT',
          body: JSON.stringify(data)
        })
        console.log('Scheduler config updated successfully', data)
        return NextResponse.json(configResult)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, execute, config'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Failed to execute scheduler action:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute scheduler action',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 