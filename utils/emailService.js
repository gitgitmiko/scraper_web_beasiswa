const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

// Konfigurasi email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // Atau service lain
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
})

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

// Template email untuk scraping berhasil
function createSuccessEmailTemplate(data) {
  return {
    subject: `✅ Scraping Beasiswa Berhasil - ${new Date().toLocaleDateString('id-ID')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">✅ Scraping Beasiswa Berhasil</h2>
        <p>Scraping otomatis telah berhasil selesai dengan detail berikut:</p>
        
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Hasil Scraping</h3>
          <ul>
            <li><strong>Status:</strong> Berhasil</li>
            <li><strong>Waktu Selesai:</strong> ${new Date().toLocaleString('id-ID')}</li>
            <li><strong>Jumlah Data:</strong> ${data.totalBeasiswa || 'N/A'} beasiswa</li>
            <li><strong>Durasi:</strong> ${data.duration || 'N/A'}</li>
          </ul>
        </div>
        
        <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>📋 Detail Log</h3>
          <p>Untuk melihat detail log lengkap, silakan akses dashboard monitoring.</p>
        </div>
        
        <p style="color: #6B7280; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem scraping beasiswa.
        </p>
      </div>
    `
  }
}

// Template email untuk scraping gagal
function createFailureEmailTemplate(data) {
  return {
    subject: `❌ Scraping Beasiswa Gagal - ${new Date().toLocaleDateString('id-ID')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">❌ Scraping Beasiswa Gagal</h2>
        <p>Scraping otomatis mengalami kegagalan dengan detail berikut:</p>
        
        <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>🚨 Detail Error</h3>
          <ul>
            <li><strong>Status:</strong> Gagal</li>
            <li><strong>Waktu Error:</strong> ${new Date().toLocaleString('id-ID')}</li>
            <li><strong>Error Message:</strong> ${data.errorMessage || 'Unknown error'}</li>
            <li><strong>Retry Attempts:</strong> ${data.retryAttempts || 0}</li>
          </ul>
        </div>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>⚠️ Action Required</h3>
          <p>Silakan periksa sistem scraping secara manual untuk mengatasi masalah ini.</p>
        </div>
        
        <p style="color: #6B7280; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem scraping beasiswa.
        </p>
      </div>
    `
  }
}

// Template email untuk laporan harian
function createDailyReportEmailTemplate(data) {
  return {
    subject: `📊 Laporan Harian Scraping Beasiswa - ${new Date().toLocaleDateString('id-ID')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">📊 Laporan Harian Scraping Beasiswa</h2>
        <p>Berikut adalah laporan harian sistem scraping beasiswa:</p>
        
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>📈 Statistik Hari Ini</h3>
          <ul>
            <li><strong>Total Beasiswa:</strong> ${data.totalBeasiswa || 0}</li>
            <li><strong>Beasiswa Baru:</strong> ${data.newBeasiswa || 0}</li>
            <li><strong>Beasiswa Expired:</strong> ${data.expiredBeasiswa || 0}</li>
            <li><strong>Status Sistem:</strong> ${data.systemStatus || 'Normal'}</li>
          </ul>
        </div>
        
        <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>🕐 Jadwal Scraping</h3>
          <ul>
            <li><strong>Scraping Terakhir:</strong> ${data.lastScraping || 'N/A'}</li>
            <li><strong>Scraping Berikutnya:</strong> ${data.nextScraping || 'N/A'}</li>
            <li><strong>Interval Update:</strong> ${data.updateInterval || 'Daily'}</li>
          </ul>
        </div>
        
        <p style="color: #6B7280; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem scraping beasiswa setiap hari.
        </p>
      </div>
    `
  }
}

// Fungsi untuk mengirim email
async function sendEmail(template, data = {}) {
  try {
    const settings = getSystemSettings()
    const notificationEmail = settings.notificationEmail
    
    if (!notificationEmail) {
      console.log('No notification email configured')
      return false
    }
    
    const emailContent = template(data)
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: notificationEmail,
      subject: emailContent.subject,
      html: emailContent.html
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
    // Log email sent
    const logPath = path.join(__dirname, '../logs/scheduler.log')
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] Email notification sent to ${notificationEmail}: ${emailContent.subject}\n`
    
    const logDir = path.dirname(logPath)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFileSync(logPath, logMessage)
    
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    
    // Log email error
    const logPath = path.join(__dirname, '../logs/scheduler.log')
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] Email notification failed: ${error.message}\n`
    
    const logDir = path.dirname(logPath)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFileSync(logPath, logMessage)
    
    return false
  }
}

// Fungsi untuk mengirim email sukses
async function sendSuccessEmail(data) {
  return await sendEmail(createSuccessEmailTemplate, data)
}

// Fungsi untuk mengirim email gagal
async function sendFailureEmail(data) {
  return await sendEmail(createFailureEmailTemplate, data)
}

// Fungsi untuk mengirim laporan harian
async function sendDailyReportEmail(data) {
  return await sendEmail(createDailyReportEmailTemplate, data)
}

module.exports = {
  sendSuccessEmail,
  sendFailureEmail,
  sendDailyReportEmail,
  getSystemSettings
} 