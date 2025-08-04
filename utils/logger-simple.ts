// Ultra simple logger for Vercel API routes (no file system at all)
class SimpleLogger {
  private formatMessage(level: string, message: string, data?: any, error?: Error): string {
    let formatted = `[${level}] ${message}`
    
    if (data) {
      formatted += ` | Data: ${JSON.stringify(data)}`
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`
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

  // Always return empty array for logs
  async getRecentLogs(): Promise<any[]> {
    return []
  }
}

export const logger = new SimpleLogger() 