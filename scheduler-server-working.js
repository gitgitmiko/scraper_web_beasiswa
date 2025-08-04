require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const { spawn } = require('child_process')
const path = require('path')

// Import Telegram service
let telegramService = null
try {
  telegramService = require('./utils/telegramService')
  console.log('✅ Telegram service loaded successfully')
} catch (error) {
  console.log('⚠️ Telegram service not available:', error.message)
}

const app = express()
const PORT = process.env.SCHEDULER_PORT || 3001

// Scheduler state
let schedulerState = {
  isRunning: false,
  isEnabled: false,
  lastUpdate: null,
  nextUpdate: null,
  isUpdating: false,
  cronJob: null,
  logs: []
}

// Middleware
app.use(cors())
app.use(express.json())

 // Health check endpoint
 app.get('/health', (req, res) => {
   res.json({ 
     status: 'healthy', 
     timestamp: new Date().toISOString(),
     service: 'scheduler-service',
     scheduler: {
       isRunning: schedulerState.isRunning,
       isEnabled: schedulerState.isEnabled,
       lastUpdate: schedulerState.lastUpdate,
       nextUpdate: schedulerState.nextUpdate,
       isUpdating: schedulerState.isUpdating
     }
   })
 })

// Get scheduler status
app.get('/status', async (req, res) => {
  try {
    res.json({
      isRunning: schedulerState.isRunning,
      isEnabled: schedulerState.isEnabled,
      lastUpdate: schedulerState.lastUpdate,
      nextUpdate: schedulerState.nextUpdate,
      isUpdating: schedulerState.isUpdating
    })
  } catch (error) {
    console.error('Failed to get scheduler status:', error)
    res.status(500).json({ 
      error: 'Failed to get scheduler status',
      message: error.message || 'Unknown error'
    })
  }
})

// Get logs
app.get('/logs', async (req, res) => {
  try {
    // If no logs available, return empty array
    if (!schedulerState.logs || schedulerState.logs.length === 0) {
      return res.json({
        logs: []
      })
    }
    
    // Return logs as simple strings only
    const logMessages = schedulerState.logs.map(log => {
      if (typeof log === 'string') {
        return log
      }
      if (log && typeof log === 'object' && log.message) {
        return log.message
      }
      if (log && typeof log === 'object' && log.scheduler) {
        // Skip complex objects with scheduler info
        return null
      }
      return String(log)
    }).filter(msg => msg !== null && msg !== undefined)
    
    res.json({
      logs: logMessages
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message || 'Unknown error'
    })
  }
})

// Start scheduler
app.post('/start', async (req, res) => {
  try {
    console.log('🚀 Starting scheduler...')
    
    if (schedulerState.isRunning) {
      return res.json({ message: 'Scheduler is already running' })
    }

    // Schedule daily at 00:00 WIB (17:00 UTC)
    schedulerState.cronJob = cron.schedule('0 17 * * *', async () => {
      console.log('⏰ Scheduled scraping triggered at:', new Date().toISOString())
      await executeScraping()
    }, {
      timezone: 'UTC'
    })

    schedulerState.isRunning = true
    schedulerState.isEnabled = true
    schedulerState.nextUpdate = getNextUpdateTime()
    
    console.log('✅ Scheduler started successfully')
    console.log('📅 Next update:', schedulerState.nextUpdate)
    
    res.json({ 
      message: 'Scheduler started successfully',
      nextUpdate: schedulerState.nextUpdate
    })
  } catch (error) {
    console.error('Failed to start scheduler:', error)
    res.status(500).json({ 
      error: 'Failed to start scheduler',
      message: error.message || 'Unknown error'
    })
  }
})

// Stop scheduler
app.post('/stop', async (req, res) => {
  try {
    console.log('🛑 Stopping scheduler...')
    
    if (schedulerState.cronJob) {
      schedulerState.cronJob.stop()
      schedulerState.cronJob = null
    }
    
    schedulerState.isRunning = false
    schedulerState.isEnabled = false
    schedulerState.nextUpdate = null
    
    console.log('✅ Scheduler stopped successfully')
    
    res.json({ message: 'Scheduler stopped successfully' })
  } catch (error) {
    console.error('Failed to stop scheduler:', error)
    res.status(500).json({ 
      error: 'Failed to stop scheduler',
      message: error.message || 'Unknown error'
    })
  }
})

 // Manual execution
 app.post('/execute', async (req, res) => {
   try {
     console.log('🔧 Manual execution requested')
     
     // Reset stuck state if needed
     if (schedulerState.isUpdating && !schedulerState.isRunning) {
       console.log('[WARNING] Resetting stuck scraping state')
       schedulerState.isUpdating = false
     }
     
     if (schedulerState.isUpdating) {
       return res.status(400).json({ 
         error: 'Scraping already in progress',
         message: 'Please wait for current scraping to complete'
       })
     }
    
    // Execute scraping in background
    executeScraping().catch(error => {
      console.error('Manual execution failed:', error)
    })
    
    res.json({ message: 'Manual execution started successfully' })
  } catch (error) {
    console.error('Failed to execute manual scraping:', error)
    res.status(500).json({ 
      error: 'Failed to execute manual scraping',
      message: error.message || 'Unknown error'
    })
  }
})

// Execute scraping function
async function executeScraping() {
  if (schedulerState.isUpdating) {
    console.log('⚠️ Scraping already in progress, skipping...')
    return
  }
  
  try {
    console.log('🔄 Starting scraping process...')
    schedulerState.isUpdating = true
    
    // Clear previous logs from database
    try {
      const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
      await fetch(`${vercelUrl}/api/logs`, { method: 'DELETE' })
      console.log('🗑️ Previous logs cleared from database')
    } catch (error) {
      console.error('Failed to clear previous logs:', error)
    }
    
    // Clear previous logs from memory
    schedulerState.logs = []
    
    // Add initial log
    const initialLog = {
      timestamp: new Date().toISOString(),
      message: '[START] Memulai proses scraping...',
      level: 'INFO'
    }
    schedulerState.logs.push(initialLog)
    
    // Save initial log to database
    try {
      const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
      await fetch(`${vercelUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: [initialLog] })
      })
    } catch (error) {
      console.error('Failed to save initial log to database:', error)
    }
    
    // Run Python scraper with UTF-8 encoding
    // Test Python environment first
    console.log('🔍 Testing Python environment...')
    
    // Check if test-python.py exists
    const fs = require('fs')
    const testPythonPath = path.join(__dirname, 'test-python.py')
    
    if (!fs.existsSync(testPythonPath)) {
      console.log('⚠️ test-python.py not found, skipping Python environment test')
      console.log('📁 Current directory:', __dirname)
      console.log('📁 Files in directory:', fs.readdirSync(__dirname).join(', '))
    } else {
      // Try different Python commands for testing
      const pythonCommands = ['python3', 'python', 'py']
      let testResult = false
      let testOutput = ''
      let testError = ''
      
      for (const pythonCmd of pythonCommands) {
        try {
          console.log(`🔍 Testing Python environment with: ${pythonCmd}`)
          const testResult = await new Promise((resolve) => {
            const testProcess = spawn(pythonCmd, ['test-python.py'], {
              cwd: __dirname,
              stdio: 'pipe',
              env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            })
            
            let output = ''
            let error = ''
            
            testProcess.stdout.on('data', (data) => {
              output += data.toString()
            })
            
            testProcess.stderr.on('data', (data) => {
              error += data.toString()
            })
            
            testProcess.on('close', (code) => {
              if (code === 0) {
                console.log(`✅ Python environment test passed with: ${pythonCmd}`)
                console.log('📋 Test output:', output)
                testOutput = output
                resolve(true)
              } else {
                console.log(`❌ Python environment test failed with: ${pythonCmd}`)
                console.log('📋 Test error:', error)
                testError = error
                resolve(false)
              }
            })
            
            testProcess.on('error', (error) => {
              console.log(`❌ Process error with ${pythonCmd}:`, error.message)
              resolve(false)
            })
          })
          
          if (testResult) {
            break
          }
        } catch (error) {
          console.log(`❌ Failed to test with ${pythonCmd}:`, error.message)
          continue
        }
      }
      
      if (!testResult) {
        console.log('⚠️ Python environment test failed, but continuing with scraping...')
      }
    }
    
    // Try different Python commands for different environments
    let pythonProcess = null
    let pythonError = null
    
    for (const pythonCmd of pythonCommands) {
      try {
        console.log(`🔍 Trying Python command: ${pythonCmd}`)
        pythonProcess = spawn(pythonCmd, ['main_scraper.py'], {
          cwd: __dirname,
          stdio: 'pipe',
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        })
        console.log(`✅ Successfully started Python process with: ${pythonCmd}`)
        break
      } catch (error) {
        console.log(`❌ Failed to start with ${pythonCmd}:`, error.message)
        pythonError = error
        continue
      }
    }
    
    if (!pythonProcess) {
      throw new Error(`Failed to start Python process. Tried: ${pythonCommands.join(', ')}. Last error: ${pythonError?.message}`)
    }
    
    return new Promise((resolve, reject) => {
      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => {
        const outputStr = data.toString()
        output += outputStr
        console.log('📊 Scraper output:', outputStr)
        
                 // Parse output and add to logs
         const lines = outputStr.split('\n').filter(line => line.trim())
         const newLogs = []
         
         lines.forEach((line, index) => {
           if (line.includes('===') || line.includes('[SUCCESS]') || line.includes('[ERROR]') || line.includes('[INFO]') || line.includes('Mengambil data')) {
             // Add small delay to ensure different timestamps
             const timestamp = new Date(Date.now() + index * 10).toISOString()
             const logEntry = {
               timestamp: timestamp,
               message: line.trim(),
               level: line.includes('[ERROR]') ? 'ERROR' : 
                      line.includes('[SUCCESS]') ? 'SUCCESS' : 
                      line.includes('[INFO]') ? 'INFO' : 'INFO'
             }
             schedulerState.logs.push(logEntry)
             newLogs.push(logEntry)
           }
         })
         
                   // Save new logs to database
          if (newLogs.length > 0) {
            try {
              const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
              fetch(`${vercelUrl}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs: newLogs })
              }).catch(error => {
                console.error('Failed to save logs to database:', error)
              })
            } catch (error) {
              console.error('Failed to save logs to database:', error)
            }
          }
      })
      
             pythonProcess.stderr.on('data', (data) => {
         const errorStr = data.toString()
         errorOutput += errorStr
         console.error('❌ Scraper error:', errorStr)
         
         // Add error to logs
         const errorLog = {
           timestamp: new Date().toISOString(),
           message: `[ERROR] ${errorStr.trim()}`,
           level: 'ERROR'
         }
         schedulerState.logs.push(errorLog)
         
                   // Save error log to database
          try {
            const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
            fetch(`${vercelUrl}/api/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logs: [errorLog] })
            }).catch(error => {
              console.error('Failed to save error log to database:', error)
            })
          } catch (error) {
            console.error('Failed to save error log to database:', error)
          }
       })
      
      pythonProcess.on('close', (code) => {
        schedulerState.isUpdating = false
        schedulerState.lastUpdate = new Date().toISOString()
        
                 // Add completion log
         const completionLog = code === 0 ? {
           timestamp: new Date().toISOString(),
           message: '[SUCCESS] Scraping selesai dengan sukses',
           level: 'SUCCESS'
         } : {
           timestamp: new Date().toISOString(),
           message: `[ERROR] Scraping gagal dengan kode: ${code}`,
           level: 'ERROR'
         }
         
         schedulerState.logs.push(completionLog)
         
                   // Save completion log to database
          try {
            const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
            fetch(`${vercelUrl}/api/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logs: [completionLog] })
            }).catch(error => {
              console.error('Failed to save completion log to database:', error)
            })
          } catch (error) {
            console.error('Failed to save completion log to database:', error)
          }
         
         if (code === 0) {
           console.log('[SUCCESS] Scraping completed successfully')
           
           // Update lastUpdate and nextUpdate
           schedulerState.lastUpdate = new Date().toISOString()
           schedulerState.nextUpdate = getNextUpdateTime()
           
           // Calculate duration
           const startTime = new Date(schedulerState.logs[0]?.timestamp || Date.now())
           const endTime = new Date()
           const durationMs = endTime.getTime() - startTime.getTime()
           const durationSeconds = Math.round(durationMs / 1000)
           const duration = `${durationSeconds} detik`
           
                       // Get actual beasiswa count from database
            let totalBeasiswa = 'N/A'
            const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
            fetch(`${vercelUrl}/api/beasiswa`)
             .then(response => response.json())
             .then(data => {
               totalBeasiswa = data.data?.length || 'N/A'
               
               // Send Telegram notification for success
               if (telegramService) {
                 telegramService.sendSuccessNotification({
                   totalBeasiswa: totalBeasiswa,
                   duration: duration,
                   retryAttempts: 1
                 }).then(() => {
                   console.log('✅ Telegram notification sent for success')
                 }).catch((telegramError) => {
                   console.error('❌ Failed to send Telegram notification:', telegramError.message)
                 })
               }
             })
             .catch(error => {
               console.error('Failed to get beasiswa count:', error)
               
               // Send Telegram notification with fallback data
               if (telegramService) {
                 telegramService.sendSuccessNotification({
                   totalBeasiswa: 'N/A',
                   duration: duration,
                   retryAttempts: 1
                 }).then(() => {
                   console.log('✅ Telegram notification sent for success')
                 }).catch((telegramError) => {
                   console.error('❌ Failed to send Telegram notification:', telegramError.message)
                 })
               }
             })
           

           
           resolve()
         } else {
           console.error('[ERROR] Scraping failed with code:', code)
           console.error('[ERROR] Error output:', errorOutput)
           
           // Calculate duration for error case
           const startTime = new Date(schedulerState.logs[0]?.timestamp || Date.now())
           const endTime = new Date()
           const durationMs = endTime.getTime() - startTime.getTime()
           const durationSeconds = Math.round(durationMs / 1000)
           const duration = `${durationSeconds} detik`
           
           // Send Telegram notification for failure
           if (telegramService) {
             telegramService.sendFailureNotification({
               errorMessage: `Scraping failed with code: ${code}`,
               retryAttempts: 1,
               duration: duration
             }).then(() => {
               console.log('✅ Telegram notification sent for failure')
             }).catch((telegramError) => {
               console.error('❌ Failed to send Telegram notification:', telegramError.message)
             })
           }
           
           // Don't reject, just log the error and continue
           console.log('[INFO] Scraping process completed with warnings')
           resolve()
         }
      })
      
      pythonProcess.on('error', (error) => {
        schedulerState.isUpdating = false
               schedulerState.logs.push({
         timestamp: new Date().toISOString(),
         message: `[ERROR] Gagal menjalankan scraper: ${error.message}`
       })
        console.error('[ERROR] Failed to start scraper:', error)
        reject(error)
      })
    })
    
     } catch (error) {
     schedulerState.isUpdating = false
     schedulerState.logs.push({
       timestamp: new Date().toISOString(),
       message: `[ERROR] Error eksekusi scraping: ${error.message}`
     })
     console.error('❌ Scraping execution failed:', error)
     
     // Send Telegram notification for execution error
     if (telegramService) {
       telegramService.sendFailureNotification({
         errorMessage: error.message,
         retryAttempts: 1,
         duration: 'N/A'
       }).then(() => {
         console.log('✅ Telegram notification sent for execution error')
       }).catch((telegramError) => {
         console.error('❌ Failed to send Telegram notification:', telegramError.message)
       })
     }
     
     throw error
   }
}

// Get next update time
function getNextUpdateTime() {
  const now = new Date()
  const nextUpdate = new Date(now)
  
  // Set to 17:00 UTC (00:00 WIB)
  nextUpdate.setUTCHours(17, 0, 0, 0)
  
  // If current time is past 17:00 UTC, set to tomorrow
  if (now.getUTCHours() >= 17) {
    nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1)
  }
  
  return nextUpdate.toISOString()
}

// Get beasiswa data
app.get('/beasiswa', async (req, res) => {
  try {
    const { kategori } = req.query
    
    // Forward to main API
    const vercelUrl = process.env.VERCEL_URL || 'https://scrapingbeasiswaweb.vercel.app'
    const apiUrl = `${vercelUrl}/api/beasiswa${kategori ? `?kategori=${kategori}` : ''}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('Failed to fetch beasiswa data:', error)
    res.status(500).json({ 
      error: 'Failed to fetch beasiswa data',
      message: error.message || 'Unknown error'
    })
  }
})

 // Reset stuck state
 app.post('/reset', async (req, res) => {
   try {
     console.log('[WARNING] Resetting scheduler state')
     schedulerState.isUpdating = false
     schedulerState.isRunning = false
     schedulerState.isEnabled = false
     schedulerState.lastUpdate = null
     schedulerState.nextUpdate = null
     
     if (schedulerState.cronJob) {
       schedulerState.cronJob.stop()
       schedulerState.cronJob = null
     }
     
     res.json({ message: 'Scheduler state reset successfully' })
   } catch (error) {
     console.error('Failed to reset scheduler state:', error)
     res.status(500).json({ 
       error: 'Failed to reset scheduler state',
       message: error.message || 'Unknown error'
     })
   }
 })



// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scheduler Service running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📈 Status: http://localhost:${PORT}/status`)
  console.log(`⏰ Auto update scheduled for 00:00 WIB (17:00 UTC) daily`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down scheduler server...')
  if (schedulerState.cronJob) {
    schedulerState.cronJob.stop()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down scheduler server...')
  if (schedulerState.cronJob) {
    schedulerState.cronJob.stop()
  }
  process.exit(0)
}) 