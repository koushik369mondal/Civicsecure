const axios = require('axios');

async function testTrackingEndpoints() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🔍 Testing tracking endpoints...\n');
    
    // Test 1: Health check first
    console.log('0. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Get recent complaints
    console.log('\n1. Testing recent complaints endpoint...');
    const recentResponse = await axios.get(`${baseURL}/api/complaints/recent?limit=3`);
    console.log('✅ Recent complaints status:', recentResponse.status);
    console.log('✅ Recent complaints data:', recentResponse.data);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      errorDetails: error.response?.data
    });
  }
}

testTrackingEndpoints();