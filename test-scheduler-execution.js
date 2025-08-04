// Test script untuk manual execution scheduler service
async function testSchedulerExecution() {
  console.log('🧪 Testing Scheduler Manual Execution');
  console.log('=====================================');
  
  const schedulerUrl = 'https://scraper-web-beasiswa.onrender.com';
  
  try {
    // Test 1: Check scheduler status
    console.log('\n📊 Checking scheduler status...');
    const statusResponse = await fetch(`${schedulerUrl}/status`);
    console.log(`Status Code: ${statusResponse.status}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Scheduler Status:', statusData);
    } else {
      const errorText = await statusResponse.text();
      console.log('❌ Status Error:', errorText);
    }
    
    // Test 2: Manual execution
    console.log('\n🚀 Starting manual execution...');
    const executeResponse = await fetch(`${schedulerUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Execute Status Code: ${executeResponse.status}`);
    
    if (executeResponse.ok) {
      const executeData = await executeResponse.json();
      console.log('✅ Execute Response:', executeData);
    } else {
      const errorText = await executeResponse.text();
      console.log('❌ Execute Error:', errorText);
    }
    
    // Test 3: Check logs
    console.log('\n📋 Checking logs...');
    const logsResponse = await fetch(`${schedulerUrl}/logs`);
    console.log(`Logs Status Code: ${logsResponse.status}`);
    
    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      console.log('✅ Logs Response:', logsData);
    } else {
      const errorText = await logsResponse.text();
      console.log('❌ Logs Error:', errorText);
    }
    
    // Test 4: Health check
    console.log('\n🏥 Health check...');
    const healthResponse = await fetch(`${schedulerUrl}/health`);
    console.log(`Health Status Code: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health Response:', healthData);
    } else {
      const errorText = await healthResponse.text();
      console.log('❌ Health Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSchedulerExecution(); 