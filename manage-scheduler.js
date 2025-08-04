const SCHEDULER_URL = 'https://beasiswa-scheduler.onrender.com'

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${SCHEDULER_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message)
    throw error
  }
}

async function checkHealth() {
  console.log('🏥 Checking service health...')
  const health = await makeRequest('/health')
  console.log('✅ Health Status:', health)
  return health
}

async function getStatus() {
  console.log('📊 Getting scheduler status...')
  const status = await makeRequest('/status')
  console.log('📈 Scheduler Status:', status)
  return status
}

async function startScheduler() {
  console.log('🚀 Starting scheduler...')
  const result = await makeRequest('/start', { method: 'POST' })
  console.log('✅ Scheduler started:', result)
  return result
}

async function stopScheduler() {
  console.log('🛑 Stopping scheduler...')
  const result = await makeRequest('/stop', { method: 'POST' })
  console.log('✅ Scheduler stopped:', result)
  return result
}

async function executeManual() {
  console.log('⚡ Executing manual scraping...')
  const result = await makeRequest('/execute', { method: 'POST' })
  console.log('✅ Manual execution started:', result)
  return result
}

async function resetScheduler() {
  console.log('🔄 Resetting scheduler state...')
  const result = await makeRequest('/reset', { method: 'POST' })
  console.log('✅ Scheduler reset:', result)
  return result
}

async function getLogs() {
  console.log('📝 Getting logs...')
  const logs = await makeRequest('/logs')
  console.log('📋 Logs:', logs)
  return logs
}

// Main function
async function main() {
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'health':
        await checkHealth()
        break
      case 'status':
        await getStatus()
        break
      case 'start':
        await startScheduler()
        break
      case 'stop':
        await stopScheduler()
        break
      case 'execute':
        await executeManual()
        break
      case 'reset':
        await resetScheduler()
        break
      case 'logs':
        await getLogs()
        break
      case 'monitor':
        console.log('🔄 Starting continuous monitoring...')
        while (true) {
          await getStatus()
          console.log('⏳ Waiting 30 seconds...')
          await new Promise(resolve => setTimeout(resolve, 30000))
        }
        break
      default:
        console.log(`
🎓 Beasiswa Scheduler Management Tool

Usage: node manage-scheduler.js <command>

Commands:
  health     - Check service health
  status     - Get scheduler status
  start      - Start scheduler
  stop       - Stop scheduler
  execute    - Execute manual scraping
  reset      - Reset scheduler state
  logs       - Get logs
  monitor    - Continuous monitoring (30s interval)

Examples:
  node manage-scheduler.js status
  node manage-scheduler.js start
  node manage-scheduler.js execute
  node manage-scheduler.js monitor
        `)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main() 