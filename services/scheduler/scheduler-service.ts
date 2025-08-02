import { SchedulerStatusModel, BeasiswaModel } from '@/services/database/models'
import { logger } from '@/utils/logger'
import { spawn } from 'child_process'
import path from 'path'

interface SchedulerConfig {
  interval: number // dalam menit
  enabled: boolean
  pythonScript: string
}

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private config: SchedulerConfig = {
    interval: 30, // 30 menit default
    enabled: false,
    pythonScript: path.join(process.cwd(), 'main_scraper.py')
  }

  constructor() {
    this.initializeScheduler()
  }

  private async initializeScheduler(): Promise<void> {
    try {
      await SchedulerStatusModel.initializeStatus()
      const status = await SchedulerStatusModel.getStatus()
      
      if (status?.is_enabled) {
        this.config.enabled = status.is_enabled
        await this.startScheduler()
        logger.info('Scheduler initialized and started')
      } else {
        logger.info('Scheduler initialized but not enabled')
      }
    } catch (error) {
      logger.error('Failed to initialize scheduler:', error instanceof Error ? error : new Error(String(error)))
    }
  }

  public async startScheduler(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Scheduler is already running')
      return
    }

    try {
      this.isRunning = true
      this.config.enabled = true
      
      await SchedulerStatusModel.updateStatus({
        is_enabled: true,
        is_updating: false
      })

      // Start immediate execution
      await this.executeScraping()

      // Schedule periodic execution
      this.intervalId = setInterval(async () => {
        await this.executeScraping()
      }, this.config.interval * 60 * 1000)

      logger.info(`Scheduler started with ${this.config.interval} minute interval`)
    } catch (error) {
      this.isRunning = false
      logger.error('Failed to start scheduler:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  public async stopScheduler(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running')
      return
    }

    try {
      this.isRunning = false
      this.config.enabled = false

      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }

      await SchedulerStatusModel.updateStatus({
        is_enabled: false,
        is_updating: false
      })

      logger.info('Scheduler stopped')
    } catch (error) {
      logger.error('Failed to stop scheduler:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  public async executeScraping(): Promise<void> {
    if (this.isRunning && !this.config.enabled) {
      logger.info('Scheduler is disabled, skipping execution')
      return
    }

    try {
      await SchedulerStatusModel.updateStatus({
        is_updating: true,
        last_update: new Date()
      })

      logger.info('Starting scraping execution')

      const result = await this.runPythonScript()
      
      if (result.success) {
        await SchedulerStatusModel.updateStatus({
          is_updating: false,
          last_update: new Date(),
          next_update: this.getNextUpdateTime()
        })
        
        logger.info('Scraping completed successfully', { 
          recordsProcessed: result.recordsProcessed 
        })
      } else {
        throw new Error(result.error || 'Unknown error during scraping')
      }
    } catch (error) {
      await SchedulerStatusModel.updateStatus({
        is_updating: false
      })
      
      logger.error('Scraping execution failed:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  private async runPythonScript(): Promise<{ success: boolean; error?: string; recordsProcessed?: number }> {
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [this.config.pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          // Try to extract records processed from output
          const recordsMatch = stdout.match(/Processed (\d+) records/)
          const recordsProcessed = recordsMatch ? parseInt(recordsMatch[1]) : 0
          
          resolve({
            success: true,
            recordsProcessed
          })
        } else {
          resolve({
            success: false,
            error: stderr || `Process exited with code ${code}`
          })
        }
      })

      pythonProcess.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        })
      })

      // Set timeout
      setTimeout(() => {
        pythonProcess.kill('SIGTERM')
        resolve({
          success: false,
          error: 'Process timeout after 10 minutes'
        })
      }, 10 * 60 * 1000) // 10 minutes timeout
    })
  }

  private getNextUpdateTime(): string {
    const nextUpdate = new Date(Date.now() + this.config.interval * 60 * 1000)
    return nextUpdate.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  public async getStatus(): Promise<{
    isRunning: boolean
    isEnabled: boolean
    lastUpdate: Date | null
    nextUpdate: string | null
    isUpdating: boolean
  }> {
    try {
      const status = await SchedulerStatusModel.getStatus()
      return {
        isRunning: this.isRunning,
        isEnabled: status?.is_enabled || false,
        lastUpdate: status?.last_update || null,
        nextUpdate: status?.next_update || null,
        isUpdating: status?.is_updating || false
      }
    } catch (error) {
      logger.error('Failed to get scheduler status:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  public async updateConfig(config: Partial<SchedulerConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config }
      
      if (this.config.enabled && !this.isRunning) {
        await this.startScheduler()
      } else if (!this.config.enabled && this.isRunning) {
        await this.stopScheduler()
      }
      
      logger.info('Scheduler config updated:', config)
    } catch (error) {
      logger.error('Failed to update scheduler config:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  public async manualExecute(): Promise<void> {
    if (this.isRunning) {
      logger.info('Manual execution triggered')
      await this.executeScraping()
    } else {
      throw new Error('Scheduler is not running')
    }
  }
}

// Singleton instance
export const schedulerService = new SchedulerService()

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down scheduler...')
  await schedulerService.stopScheduler()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down scheduler...')
  await schedulerService.stopScheduler()
  process.exit(0)
}) 