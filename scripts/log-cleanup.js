const fs = require('fs')
const path = require('path')

// File untuk membaca pengaturan sistem
const settingsFile = path.join(__dirname, '../data/system-settings.json')
const logFile = path.join(__dirname, '../logs/scheduler.log')

// Fungsi untuk membaca pengaturan
function getSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading settings:', error)
  }
  
  // Default settings
  return {
    logRetention: 30 // 30 hari default
  }
}

// Fungsi untuk membersihkan log lama
function cleanupOldLogs() {
  try {
    const settings = getSettings()
    const retentionDays = settings.logRetention || 30
    
    if (!fs.existsSync(logFile)) {
      console.log('Log file tidak ditemukan')
      return
    }
    
    const logContent = fs.readFileSync(logFile, 'utf-8')
    const logLines = logContent.split('\n').filter(line => line.trim())
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const filteredLines = logLines.filter(line => {
      const match = line.match(/^\[(.*?)\]/)
      if (match) {
        const logDate = new Date(match[1])
        return logDate >= cutoffDate
      }
      return true // Keep lines without timestamp
    })
    
    const newLogContent = filteredLines.join('\n') + '\n'
    fs.writeFileSync(logFile, newLogContent)
    
    const removedCount = logLines.length - filteredLines.length
    console.log(`Log cleanup selesai: ${removedCount} log lama dihapus`)
    
    // Write cleanup log
    const timestamp = new Date().toISOString()
    const cleanupLog = `[${timestamp}] Log cleanup: ${removedCount} log lama dihapus (retention: ${retentionDays} hari)\n`
    fs.appendFileSync(logFile, cleanupLog)
    
  } catch (error) {
    console.error('Error during log cleanup:', error)
  }
}

// Jalankan cleanup jika script dijalankan langsung
if (require.main === module) {
  console.log('Memulai log cleanup...')
  cleanupOldLogs()
  console.log('Log cleanup selesai')
}

module.exports = { cleanupOldLogs } 