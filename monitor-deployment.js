const SCHEDULER_URL = 'https://beasiswa-scheduler.onrender.com'

async function checkDeploymentStatus() {
  console.log('🔍 Checking deployment status...')
  
  try {
    // Check health
    const healthResponse = await fetch(`${SCHEDULER_URL}/health`)
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('✅ Service is healthy:', health.status)
      console.log('📊 Scheduler info:', health.scheduler)
    } else {
      console.log('❌ Service health check failed')
      return false
    }
    
    // Check status
    const statusResponse = await fetch(`${SCHEDULER_URL}/status`)
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      console.log('📈 Scheduler status:', status)
      
      if (status.isRunning && status.isEnabled) {
        console.log('🎉 Deployment successful! Scheduler is running.')
        return true
      } else {
        console.log('⚠️ Scheduler is not running properly')
        return false
      }
    } else {
      console.log('❌ Status check failed')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error.message)
    return false
  }
}

async function testPythonEnvironment() {
  console.log('🐍 Testing Python environment...')
  
  try {
    const response = await fetch(`${SCHEDULER_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Manual execution started:', result.message)
      
      // Wait a bit and check logs
      setTimeout(async () => {
        try {
          const logsResponse = await fetch(`${SCHEDULER_URL}/logs`)
          if (logsResponse.ok) {
            const logs = await logsResponse.json()
            console.log('📋 Recent logs:', logs.logs)
            
            // Check if Python test passed
            const hasPythonError = logs.logs.some(log => 
              log.includes('Python environment test failed') || 
              log.includes('ModuleNotFoundError')
            )
            
            if (hasPythonError) {
              console.log('❌ Python environment test still failing')
              console.log('🔄 Please deploy again to Render with updated configuration')
            } else {
              console.log('✅ Python environment test passed!')
            }
          }
        } catch (error) {
          console.error('❌ Error checking logs:', error.message)
        }
      }, 5000)
      
    } else {
      console.log('❌ Manual execution failed')
    }
    
  } catch (error) {
    console.error('❌ Error testing Python environment:', error.message)
  }
}

async function main() {
  console.log('🚀 Deployment Monitor')
  console.log('=====================')
  
  const isHealthy = await checkDeploymentStatus()
  
  if (isHealthy) {
    console.log('\n🔧 Testing Python environment...')
    await testPythonEnvironment()
  } else {
    console.log('\n❌ Service is not healthy. Please check deployment.')
    console.log('📋 Follow the guide in deploy-to-render.md')
  }
}

main() 