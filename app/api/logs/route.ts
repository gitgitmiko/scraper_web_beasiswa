import { NextRequest, NextResponse } from 'next/server'
import { LogModel } from '@/services/database/models'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const logs = await LogModel.getRecentLogs(limit)
    
    // Sort logs by timestamp in descending order (newest first)
    logs.sort((a, b) => {
      const dateA = new Date(b.timestamp || b.created_at || Date.now()).getTime()
      const dateB = new Date(a.timestamp || a.created_at || Date.now()).getTime()
      return dateA - dateB
    })
    
    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        message: log.message,
        level: log.level,
        timestamp: log.timestamp || log.created_at, // Use timestamp as primary, fallback to created_at
        created_at: log.created_at
      })),
      count: logs.length
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logs',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
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

    // Transform logs to match database format
    const transformedLogs = logs.map(log => ({
      message: log.message,
      level: log.level || 'INFO',
      timestamp: new Date(log.timestamp || Date.now())
    }))

    await LogModel.insertMany(transformedLogs)

    console.log('Successfully inserted logs', { count: transformedLogs.length })

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${transformedLogs.length} log records`,
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
    await LogModel.deleteAll()
    
    console.log('All logs cleared successfully')
    
    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully',
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