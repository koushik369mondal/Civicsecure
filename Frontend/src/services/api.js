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

export default api;
