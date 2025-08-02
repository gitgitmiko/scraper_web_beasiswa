require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const path = require('path')

// Konfigurasi bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })

// Fungsi untuk membaca pengaturan sistem
function getSystemSettings() {
  try {
    const settingsFile = path.join(__dirname, '../data/system-settings.json')
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading system settings:', error)
  }
  
  return {
    notificationEmail: ''
  }
}

// Template message untuk scraping berhasil
function createSuccessMessage(data) {
  const timestamp = new Date().toLocaleString('id-ID')
  
  return `✅ <b>Scraping Beasiswa Berhasil</b>

📊 <b>Hasil Scraping:</b>
• Status: Berhasil
• Waktu Selesai: ${timestamp}
• Jumlah Data: ${data.totalBeasiswa || 'N/A'} beasiswa
• Durasi: ${data.duration || 'N/A'}
• Percobaan: ${data.retryAttempts || 1}x

📋 <b>Detail Log:</b>
Untuk melihat detail log lengkap, silakan akses dashboard monitoring.

🤖 <i>Notifikasi otomatis dari sistem scraping beasiswa</i>`
}

// Template message untuk scraping gagal
function createFailureMessage(data) {
  const timestamp = new Date().toLocaleString('id-ID')
  
  return `❌ <b>Scraping Beasiswa Gagal</b>

🚨 <b>Detail Error:</b>
• Status: Gagal
• Waktu Error: ${timestamp}
• Error Message: ${data.errorMessage || 'Unknown error'}
• Retry Attempts: ${data.retryAttempts || 0}
• Durasi: ${data.duration || 'N/A'}

⚠️ <b>Action Required:</b>
Silakan periksa sistem scraping secara manual untuk mengatasi masalah ini.

🤖 <i>Notifikasi otomatis dari sistem scraping beasiswa</i>`
}

// Template message untuk laporan harian
function createDailyReportMessage(data) {
  const timestamp = new Date().toLocaleString('id-ID')
  
  return `📊 <b>Laporan Harian Scraping Beasiswa</b>

📈 <b>Statistik Hari Ini:</b>
• Total Beasiswa: ${data.totalBeasiswa || 0}
• Beasiswa Baru: ${data.newBeasiswa || 0}
• Beasiswa Expired: ${data.expiredBeasiswa || 0}
• Status Sistem: ${data.systemStatus || 'Normal'}

🕐 <b>Jadwal Scraping:</b>
• Scraping Terakhir: ${data.lastScraping || 'N/A'}
• Scraping Berikutnya: ${data.nextScraping || 'N/A'}
• Interval Update: ${data.updateInterval || 'Daily'}

📅 <b>Laporan dibuat:</b> ${timestamp}

🤖 <i>Laporan otomatis dari sistem scraping beasiswa</i>`
}

// Fungsi untuk mengirim notifikasi Telegram
async function sendTelegramNotification(message) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID
    
    if (!chatId) {
      console.log('No Telegram chat ID configured')
      return false
    }
    
    const result = await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
    
    console.log('Telegram notification sent successfully:', result.message_id)
    
    // Log notification sent
    const logPath = path.join(__dirname, '../logs/scheduler.log')
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] Telegram notification sent: ${result.message_id}\n`
    
    const logDir = path.dirname(logPath)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFileSync(logPath, logMessage)
    
    return true
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    
    // Log notification error
    const logPath = path.join(__dirname, '../logs/scheduler.log')
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] Telegram notification failed: ${error.message}\n`
    
    const logDir = path.dirname(logPath)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFileSync(logPath, logMessage)
    
    return false
  }
}

// Fungsi untuk mengirim notifikasi sukses
async function sendSuccessNotification(data) {
  const message = createSuccessMessage(data)
  return await sendTelegramNotification(message)
}

// Fungsi untuk mengirim notifikasi gagal
async function sendFailureNotification(data) {
  const message = createFailureMessage(data)
  return await sendTelegramNotification(message)
}

// Fungsi untuk mengirim laporan harian
async function sendDailyReportNotification(data) {
  const message = createDailyReportMessage(data)
  return await sendTelegramNotification(message)
}

// Fungsi untuk test koneksi bot
async function testBotConnection() {
  try {
    const me = await bot.getMe()
    console.log('Bot connected successfully:', me.username)
    return true
  } catch (error) {
    console.error('Bot connection failed:', error.message)
    return false
  }
}

module.exports = {
  sendSuccessNotification,
  sendFailureNotification,
  sendDailyReportNotification,
  testBotConnection,
  getSystemSettings
} 