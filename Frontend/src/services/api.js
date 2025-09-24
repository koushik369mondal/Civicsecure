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

// Add caching utilities
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_PREFIX = 'civicsecure_';

export const cacheAPI = {
  set: (key, data) => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_DURATION
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
  },

  get: (key) => {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    try {
      const cacheItem = JSON.parse(cached);
      if (Date.now() > cacheItem.expires) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      return cacheItem.data;
    } catch {
      return null;
    }
  },

  clear: (key) => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  clearAll: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};

// Government schemes API
export const schemesAPI = {
  getSchemes: async (useCache = true) => {
    const cacheKey = 'government_schemes';
    
    // Try cache first
    if (useCache) {
      const cached = cacheAPI.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached schemes data');
        return cached;
      }
    }

    try {
      // Import RSSFeedService dynamically to avoid circular imports
      const { RSSFeedService } = await import('./rssFeedService');
      
      // Fetch fresh data
      const schemes = await RSSFeedService.fetchGovernmentSchemes();
      
      // Cache the result
      cacheAPI.set(cacheKey, schemes);
      
      return schemes;
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
      
      // Return cached data even if expired, or fallback
      const expiredCache = cacheAPI.get(cacheKey);
      if (expiredCache) {
        console.log('⚠️ Using expired cache due to API failure');
        return expiredCache;
      }
      
      // Last resort: fallback schemes
      console.log('🔄 Using fallback schemes');
      const { RSSFeedService } = await import('./rssFeedService');
      return RSSFeedService.getFallbackSchemes();
    }
  },

  refreshSchemes: async () => {
    cacheAPI.clear('government_schemes');
    return await schemesAPI.getSchemes(false);
  }
};
