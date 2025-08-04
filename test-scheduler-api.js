const VERCEL_API_URL = 'https://scrapingbeasiswaweb.vercel.app/api/scheduler-simple'

async function testSchedulerAPI() {
  console.log('🧪 Testing Scheduler API')
  console.log('========================')
  
  try {
    // Test status endpoint
    console.log('\n📊 Testing status endpoint...')
    const statusResponse = await fetch(`${VERCEL_API_URL}?action=status`)
    console.log(`Status Code: ${statusResponse.status}`)
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      console.log('✅ Status API Response:', statusData)
    } else {
      const errorText = await statusResponse.text()
      console.log('❌ Status API Error:', errorText)
    }
    
    // Test logs endpoint
    console.log('\n📋 Testing logs endpoint...')
    const logsResponse = await fetch(`${VERCEL_API_URL}?action=logs`)
    console.log(`Status Code: ${logsResponse.status}`)
    
    if (logsResponse.ok) {
      const logsData = await logsResponse.json()
      console.log('✅ Logs API Response:', logsData)
    } else {
      const errorText = await logsResponse.text()
      console.log('❌ Logs API Error:', errorText)
    }
    
    // Test direct scheduler service
    console.log('\n🔗 Testing direct scheduler service...')
    const directResponse = await fetch('https://beasiswa-scheduler.onrender.com/status')
    console.log(`Direct Status Code: ${directResponse.status}`)
    
    if (directResponse.ok) {
      const directData = await directResponse.json()
      console.log('✅ Direct Scheduler Response:', directData)
    } else {
      const errorText = await directResponse.text()
      console.log('❌ Direct Scheduler Error:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSchedulerAPI() 