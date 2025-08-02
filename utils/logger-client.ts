interface LogEntry {
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  data?: any
  error?: Error
}

class ClientLogger {
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

  info(message: string, data?: any): void {
    console.log(this.formatMessage('INFO', message, data))
  }

  error(message: string, error?: Error, data?: any): void {
    console.error(this.formatMessage('ERROR', message, data, error))
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('WARN', message, data))
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data))
    }
  }

  // Client-safe methods that don't use fs
  async getRecentLogs(): Promise<LogEntry[]> {
    // In client-side, we can't read log files
    // This would need to be handled via API calls
    return []
  }
}

export const clientLogger = new ClientLogger() 