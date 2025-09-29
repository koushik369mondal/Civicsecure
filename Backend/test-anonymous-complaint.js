const axios = require('axios');

async function testAnonymousComplaint() {
    console.log('Testing anonymous complaint submission...');
    
    const testComplaint = {
        title: "Test Complaint",
        category: "Roads & Infrastructure",
        description: "This is a test complaint to verify the database connection",
        location: {
            latitude: 26.1445,
            longitude: 91.7362,
            address: "Test Location, Guwahati",
            formatted: "Test Location, Guwahati, Assam"
        },
        priority: "medium",
        reporterType: "anonymous",
        contactMethod: "email",
        phone: "9876543210"
    };
    
    try {
        const response = await axios.post('http://localhost:5000/api/complaints/anonymous', testComplaint);
        console.log('✅ Anonymous complaint submission successful!');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Anonymous complaint submission failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('Backend server is not running. Please start it with: npm run dev');
        }
    }
}

testAnonymousComplaint();