const axios = require('axios');

async function testBackend() {
    console.log('Testing backend connection...');
    
    try {
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Backend is running');
        console.log('Health check result:', healthResponse.data);
        
        // Test authentication endpoints
        console.log('\nTesting authentication endpoints...');
        
        // Test sending OTP
        try {
            const otpResponse = await axios.post('http://localhost:5000/api/send-otp', {
                phoneNumber: '+919876543210'
            });
            console.log('✅ Send OTP endpoint working:', otpResponse.data);
        } catch (error) {
            console.log('❌ Send OTP error:', error.response?.data || error.message);
        }
        
        // Test with invalid token
        try {
            const invalidTokenResponse = await axios.post('http://localhost:5000/api/complaints', 
                { title: 'Test', category: 'Test', description: 'Test' },
                { headers: { Authorization: 'Bearer invalid-token' } }
            );
        } catch (error) {
            console.log('Expected error with invalid token:', error.response?.data);
        }
        
    } catch (error) {
        console.log('❌ Backend not running or not accessible');
        console.log('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('Please start the backend server with: npm run dev');
        }
    }
}

testBackend();