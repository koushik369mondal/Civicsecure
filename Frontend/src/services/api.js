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

// Complaint API functions
export const complaintAPI = {
    // Submit a new complaint
    submitComplaint: async (complaintData) => {
        try {
            const response = await api.post('/complaints', complaintData);
            return response.data;
        } catch (error) {
            console.error('Complaint submission error:', error);
            throw error;
        }
    },

    // Get all complaints with optional filtering
    getComplaints: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    queryParams.append(key, filters[key]);
                }
            });
            
            const url = `/complaints${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get complaints error:', error);
            throw error;
        }
    },

    // Get complaint by ID
    getComplaintById: async (complaintId) => {
        try {
            const response = await api.get(`/complaints/${complaintId}`);
            return response.data;
        } catch (error) {
            console.error('Get complaint by ID error:', error);
            throw error;
        }
    },

    // Get complaint statistics
    getComplaintStats: async () => {
        try {
            const response = await api.get('/complaints/stats');
            return response.data;
        } catch (error) {
            console.error('Get complaint stats error:', error);
            throw error;
        }
    },

    // Update complaint status (admin only)
    updateComplaintStatus: async (complaintId, status, resolutionNotes = '') => {
        try {
            const response = await api.put(`/complaints/${complaintId}/status`, {
                status,
                resolution_notes: resolutionNotes
            });
            return response.data;
        } catch (error) {
            console.error('Update complaint status error:', error);
            throw error;
        }
    }
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
