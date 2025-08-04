// Script untuk reset scheduler yang stuck
async function resetScheduler() {
  console.log('🔄 Resetting Scheduler Service');
  console.log('==============================');
  
  const schedulerUrl = 'https://scraper-web-beasiswa.onrender.com';
  
  try {
    // Reset scheduler state
    console.log('\n🛑 Resetting scheduler state...');
    const resetResponse = await fetch(`${schedulerUrl}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Reset Status Code: ${resetResponse.status}`);
    
    if (resetResponse.ok) {
      const resetData = await resetResponse.json();
      console.log('✅ Reset Response:', resetData);
    } else {
      const errorText = await resetResponse.text();
      console.log('❌ Reset Error:', errorText);
    }
    
    // Check status after reset
    console.log('\n📊 Checking status after reset...');
    const statusResponse = await fetch(`${schedulerUrl}/status`);
    console.log(`Status Code: ${statusResponse.status}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Status after reset:', statusData);
    } else {
      const errorText = await statusResponse.text();
      console.log('❌ Status Error:', errorText);
    }
    
    // Health check
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
    console.error('❌ Reset failed:', error.message);
  }
}

resetScheduler(); 