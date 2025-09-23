import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (aadhaarNumber, phoneNumber) =>
        api.post('/send-otp', { phoneNumber }),

    verifyOTP: (phoneNumber, otp) =>
        api.post('/verify-otp', { phoneNumber, otp }),

    login: (phoneNumber) =>
        api.post('/send-otp', { phoneNumber }),

    verifyLoginOTP: (phoneNumber, otp) =>
        api.post('/verify-otp', { phoneNumber, otp }),

    getProfile: () =>
        api.get('/user/profile')
};

// Validate Aadhaar number against database
export const validateAadhaar = async (aadhaarNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-aadhaar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aadhaarNumber })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Aadhaar validation failed');
    }

    return data;
  } catch (error) {
    console.error('Aadhaar validation error:', error);
    throw error;
  }
};

// Get Aadhaar database statistics (for debugging)
export const getAadhaarStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/aadhaar/stats`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stats');
    }

    return data;
  } catch (error) {
    console.error('Stats fetch error:', error);
    throw error;
  }
};

export default api;
