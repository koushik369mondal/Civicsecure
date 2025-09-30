import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        // Debug: Log token info
        console.log('API Request - Token found:', {
            length: token.length,
            preview: token.substring(0, 50) + '...',
            startsWithBearer: token.startsWith('Bearer ')
        });
        
        // Ensure we don't double-add Bearer prefix
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        config.headers.Authorization = `Bearer ${cleanToken}`;
        
        console.log('API Request - Authorization header:', config.headers.Authorization.substring(0, 50) + '...');
    } else {
        console.log('API Request - No token found in localStorage');
    }
    return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response - Success:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log('API Response - Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message,
            errorName: error.response?.data?.error,
            fullError: error.response?.data
        });
        
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // If it's a token format error, show a more specific message
            if (error.response.data?.message?.includes('token format')) {
                console.error('Token format error. Please login again.');
                // You could redirect to login here if needed
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    sendOTP: (phoneNumber) =>
        api.post('/send-otp', { phoneNumber }),

    verifyOTP: (phoneNumber, otp) =>
        api.post('/verify-otp', { phoneNumber, otp }),

    validateToken: () =>
        api.get('/validate-token'),

    getProfile: () =>
        api.get('/user/profile'),
        
    updateProfile: (data) =>
        api.put('/user/profile', data)
};

export const complaintAPI = {
    submitComplaint: (data) =>
        api.post('/complaints/anonymous', data),

    getUserComplaints: (params = {}) =>
        api.get('/complaints/my', { params }),

    getComplaintById: (id) =>
        api.get(`/complaints/${id}`),

    updateComplaintStatus: (id, statusData) =>
        api.put(`/complaints/${id}/status`, statusData),

    getUserComplaintStats: () =>
        api.get('/complaints/stats/my'),
    
    // Public tracking endpoints (no authentication required)
    trackComplaint: (complaintId) =>
        api.get(`/track/${complaintId}`),
    
    getRecentComplaints: (params = {}) =>
        api.get('/complaints/recent', { params }),
    
    getComplaintStats: () =>
        api.get('/complaints/stats')
};

export default api;
