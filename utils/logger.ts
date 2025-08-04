import fs from 'fs'
import path from 'path'

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  data?: any
  error?: Error
}

class Logger {
  private logDir: string
  private maxLogSize: number = 10 * 1024 * 1024 // 10MB
  private maxLogFiles: number = 5
  private isVercel: boolean

  constructor() {
    this.isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    this.logDir = path.join(process.cwd(), 'logs')
    
    // Only create log directory if not in Vercel
    if (!this.isVercel) {
      this.ensureLogDirectory()
    }
  }

  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
    } catch (error) {
      console.warn('Failed to create log directory, using console logging only:', error)
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0]
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`)
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    // Skip file logging in Vercel/production
    if (this.isVercel) {
      return
    }

    try {
      const fileName = this.getLogFileName(entry.level)
      const logLine = JSON.stringify({
        ...entry,
        timestamp: new Date().toISOString()
      }) + '\n'

      await fs.promises.appendFile(fileName, logLine)
      
      // Rotate logs if file is too large
      await this.rotateLogs(fileName)
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  private async rotateLogs(fileName: string): Promise<void> {
    if (this.isVercel) {
      return
    }

    try {
      const stats = await fs.promises.stat(fileName)
      if (stats.size > this.maxLogSize) {
        const dir = path.dirname(fileName)
        const baseName = path.basename(fileName, '.log')
        const ext = '.log'
        
        // Remove oldest log file if we have too many
        for (let i = this.maxLogFiles - 1; i >= 1; i--) {
          const oldFile = path.join(dir, `${baseName}-${i}${ext}`)
          const newFile = path.join(dir, `${baseName}-${i + 1}${ext}`)
          
          if (fs.existsSync(oldFile)) {
            if (i === this.maxLogFiles - 1) {
              await fs.promises.unlink(oldFile)
            } else {
              await fs.promises.rename(oldFile, newFile)
            }
          }
        }
        
        // Rename current log file
        const backupFile = path.join(dir, `${baseName}-1${ext}`)
        await fs.promises.rename(fileName, backupFile)
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error)
    }
  }

  private formatMessage(level: string, message: string, data?: any, error?: Error): string {
    let formatted = `[${level}] ${message}`
    
    if (data) {
      formatted += ` | Data: ${JSON.stringify(data)}`
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`
      if (error.stack) {
        formatted += ` | Stack: ${error.stack}`
      }
    }
    
    return formatted
  }

  async info(message: string, data?: any): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    }
    
    console.log(this.formatMessage('INFO', message, data))
    await this.writeLog(entry)
  }

  async error(message: string, error?: Error, data?: any): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error,
      data
    }
    
    console.error(this.formatMessage('ERROR', message, data, error))
    await this.writeLog(entry)
  }

  async warn(message: string, data?: any): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data
    }
    
    console.warn(this.formatMessage('WARN', message, data))
    await this.writeLog(entry)
  }

  async debug(message: string, data?: any): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        data
      }
      
      console.debug(this.formatMessage('DEBUG', message, data))
      await this.writeLog(entry)
    }
  }

  // Sync methods for immediate logging (useful for critical errors)
  infoSync(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    }
    
    console.log(this.formatMessage('INFO', message, data))
    this.writeLog(entry).catch(console.error)
  }

  errorSync(message: string, error?: Error, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error,
      data
    }
    
    console.error(this.formatMessage('ERROR', message, data, error))
    this.writeLog(entry).catch(console.error)
  }

  // Get recent logs
  async getRecentLogs(level?: string, limit: number = 100): Promise<LogEntry[]> {
    // Return empty array in Vercel/production since we don't write to files
    if (this.isVercel) {
      return []
    }

    try {
      const logs: LogEntry[] = []
      const files = await fs.promises.readdir(this.logDir)
      
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .filter(file => !level || file.startsWith(level.toLowerCase()))
        .sort()
        .reverse()
        .slice(0, 5) // Get last 5 log files
      
      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file)
        const content = await fs.promises.readFile(filePath, 'utf-8')
        const lines = content.trim().split('\n').reverse().slice(0, limit)
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line) as LogEntry
            logs.push(entry)
          } catch (parseError) {
            // Skip invalid JSON lines
          }
        }
      }
      
      return logs.slice(0, limit)
    } catch (error) {
      console.error('Failed to read logs:', error)
      return []
    }
  }
}

export const logger = new Logger() 