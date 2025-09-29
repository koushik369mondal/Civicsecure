const jwt = require('jsonwebtoken');

// Test JWT generation and validation
function testJWT() {
    console.log('Testing JWT generation and validation...');
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
    // Generate a test token
    const testPayload = {
        userId: 123,
        phone: '+919876543210',
        timestamp: Date.now(),
        iat: Math.floor(Date.now() / 1000)
    };
    
    try {
        const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '30d' });
        console.log('\n✅ Token generated successfully');
        console.log('Token length:', token.length);
        console.log('Token parts:', token.split('.').length);
        console.log('Token preview:', token.substring(0, 50) + '...');
        
        // Test verification
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('\n✅ Token verified successfully');
            console.log('Decoded payload:', decoded);
        } catch (verifyError) {
            console.log('\n❌ Token verification failed');
            console.log('Verify error:', verifyError.message);
            console.log('Error name:', verifyError.name);
        }
        
        // Test with Bearer prefix (simulate frontend)
        const bearerToken = `Bearer ${token}`;
        const extractedToken = bearerToken.substring(7);
        
        try {
            const decodedBearer = jwt.verify(extractedToken, JWT_SECRET);
            console.log('\n✅ Bearer token extraction and verification successful');
        } catch (bearerError) {
            console.log('\n❌ Bearer token verification failed');
            console.log('Bearer error:', bearerError.message);
        }
        
    } catch (signError) {
        console.log('\n❌ Token generation failed');
        console.log('Sign error:', signError.message);
    }
}

testJWT();