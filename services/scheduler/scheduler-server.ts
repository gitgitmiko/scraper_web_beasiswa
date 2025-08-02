import express from 'express'
import cors from 'cors'
import { schedulerService } from './scheduler-service'
import { logger } from '@/utils/logger'
import { BeasiswaModel, SchedulerStatusModel } from '@/services/database/models'

const app = express()
const PORT = process.env.SCHEDULER_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'scheduler-service'
  })
})

// Get scheduler status
app.get('/status', async (req, res) => {
  try {
    const status = await schedulerService.getStatus()
    res.json(status)
  } catch (error) {
    logger.error('Failed to get scheduler status:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to get scheduler status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Start scheduler
app.post('/start', async (req, res) => {
  try {
    await schedulerService.startScheduler()
    res.json({ message: 'Scheduler started successfully' })
  } catch (error) {
    logger.error('Failed to start scheduler:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to start scheduler',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Stop scheduler
app.post('/stop', async (req, res) => {
  try {
    await schedulerService.stopScheduler()
    res.json({ message: 'Scheduler stopped successfully' })
  } catch (error) {
    logger.error('Failed to stop scheduler:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to stop scheduler',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Manual execution
app.post('/execute', async (req, res) => {
  try {
    await schedulerService.manualExecute()
    res.json({ message: 'Manual execution completed successfully' })
  } catch (error) {
    logger.error('Failed to execute manual scraping:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to execute manual scraping',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update scheduler config
app.put('/config', async (req, res) => {
  try {
    const { interval, enabled } = req.body
    await schedulerService.updateConfig({ interval, enabled })
    res.json({ message: 'Scheduler config updated successfully' })
  } catch (error) {
    logger.error('Failed to update scheduler config:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to update scheduler config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get beasiswa data
app.get('/beasiswa', async (req, res) => {
  try {
    const { kategori } = req.query
    
    let beasiswaData
    if (kategori) {
      beasiswaData = await BeasiswaModel.getByCategory(kategori as string)
    } else {
      beasiswaData = await BeasiswaModel.getAll()
    }
    
    res.json({
      success: true,
      data: beasiswaData,
      count: beasiswaData.length
    })
  } catch (error) {
    logger.error('Failed to fetch beasiswa data:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to fetch beasiswa data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get logs
app.get('/logs', async (req, res) => {
  try {
    const { level, limit } = req.query
    const logs = await logger.getRecentLogs(
      level as string, 
      limit ? parseInt(limit as string) : 100
    )
    res.json({ logs })
  } catch (error) {
    logger.error('Failed to fetch logs:', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({ 
      error: 'Failed to fetch logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error instanceof Error ? error : new Error(String(error)))
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  logger.info(`Scheduler service started on port ${PORT}`)
  console.log(`🚀 Scheduler Service running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📈 Status: http://localhost:${PORT}/status`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down scheduler server...')
  await schedulerService.stopScheduler()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down scheduler server...')
  await schedulerService.stopScheduler()
  process.exit(0)
}) 