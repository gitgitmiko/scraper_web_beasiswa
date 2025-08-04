import { NextRequest, NextResponse } from 'next/server'

// Sample logs data sebagai fallback
const sampleLogs = [
  {
    id: 1,
    message: 'Scheduler service started successfully',
    level: 'INFO',
    timestamp: new Date(Date.now() - 60000).toISOString(), // 1 menit yang lalu
    created_at: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: 2,
    message: 'Database connection established',
    level: 'INFO',
    timestamp: new Date(Date.now() - 30000).toISOString(), // 30 detik yang lalu
    created_at: new Date(Date.now() - 30000).toISOString()
  },
  {
    id: 3,
    message: 'Monitoring dashboard loaded',
    level: 'INFO',
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Return sample logs for now
    const logs = sampleLogs.slice(0, limit)
    
    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        message: log.message,
        level: log.level,
        timestamp: log.timestamp,
        created_at: log.created_at
      })),
      count: logs.length,
      message: 'Using sample logs data (database connection not available)'
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error instanceof Error ? error.message : String(error))
    
    // Return empty logs array as fallback
    return NextResponse.json({
      success: true,
      logs: [],
      count: 0,
      message: 'Failed to fetch logs, returning empty array'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { logs } = body

    if (!Array.isArray(logs)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format. Expected array of log objects.'
      }, { status: 400 })
    }

    console.log('Received logs for insertion:', { count: logs.length })

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${logs.length} log records (sample mode)`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to insert logs:', error instanceof Error ? error.message : String(error))

    return NextResponse.json({
      success: false,
      error: 'Failed to insert logs',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Logs clear requested (sample mode)')
    
    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully (sample mode)',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to clear logs:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to clear logs',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 