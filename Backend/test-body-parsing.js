#!/usr/bin/env node

/**
 * Test script for validating Express.js request body parsing fixes
 * This script tests various scenarios including malformed requests, missing headers, etc.
 */

const axios = require('axios').default;

const BASE_URL = 'http://localhost:5000';

console.log('🧪 Starting Express.js Request Body Validation Tests...\n');

async function runTests() {
  const tests = [
    {
      name: '✅ Test 1: Valid JSON request',
      test: async () => {
        const response = await axios.post(`${BASE_URL}/api/test-body`, {
          aadhaarNumber: '123456789012',
          name: 'Test User'
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
      }
    },
    
    {
      name: '❌ Test 2: Request without Content-Type header',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/test-body`, {
            aadhaarNumber: '123456789012'
          });
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    },
    
    {
      name: '❌ Test 3: Empty request body',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/test-body`, null, {
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    },
    
    {
      name: '❌ Test 4: Invalid JSON format',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/test-body`, 
            '{"aadhaarNumber": "123456789012"', // Invalid JSON - missing closing brace
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    },
    
    {
      name: '✅ Test 5: Valid Aadhaar validation request',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/validate-aadhaar`, {
            aadhaarNumber: '123456789012'
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    },
    
    {
      name: '❌ Test 6: Aadhaar validation without required field',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/validate-aadhaar`, {
            name: 'Test User' // Missing aadhaarNumber
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    },
    
    {
      name: '❌ Test 7: Aadhaar validation with undefined body',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/validate-aadhaar`, undefined, {
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data;
        } catch (error) {
          return { error: error.response?.data || error.message };
        }
      }
    }
  ];

  for (let i = 0; i < tests.length; i++) {
    const { name, test } = tests[i];
    console.log(`${name}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await test();
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Test failed:', error.message);
    }
    
    console.log('\n');
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function main() {
  try {
    // Check if server is running
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running at', BASE_URL);
    console.log('🚀 Running tests...\n');
    
    await runTests();
    
    console.log('🏁 All tests completed!');
  } catch (error) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the server with: npm run dev');
    console.error('Error:', error.message);
  }
}

main().catch(console.error);