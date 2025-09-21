import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add device ID for anonymous requests
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = api;

export const issuesAPI = {
  // Get all issues
  getIssues: (params = {}) => api.get('/issues', { params }),
  
  // Get nearby issues
  getNearbyIssues: (latitude, longitude, radius = 1) => 
    api.get('/issues/nearby', { 
      params: { latitude, longitude, radius } 
    }),
  
  // Get issue by ID
  getIssue: (id) => api.get(`/issues/${id}`),
  
  // Create new issue
  createIssue: (issueData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(issueData).forEach(key => {
      if (key !== 'media' && issueData[key] !== undefined) {
        formData.append(key, issueData[key]);
      }
    });
    
    // Add media files
    if (issueData.media && issueData.media.length > 0) {
      issueData.media.forEach((file, index) => {
        formData.append('media', file);
      });
    }
    
    return api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upvote issue
  upvoteIssue: (id) => api.post(`/issues/${id}/upvote`),
  
  // Get issue statistics
  getStats: (params = {}) => api.get('/issues/stats/overview', { params }),
};

export const gamificationAPI = {
  // Get leaderboard
  getLeaderboard: (params = {}) => api.get('/gamification/leaderboard', { params }),
  
  // Get user points
  getUserPoints: () => api.get('/gamification/points'),
  
  // Get achievements
  getAchievements: () => api.get('/gamification/achievements'),
  
  // Get user achievements
  getUserAchievements: () => api.get('/gamification/achievements/user'),
  
  // Check for new achievements
  checkAchievements: () => api.post('/gamification/check-achievements'),
};

export const usersAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Get user's issues
  getUserIssues: (params = {}) => api.get('/users/issues', { params }),
  
  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const adminAPI = {
  // Get dashboard data
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Get all issues for admin
  getAdminIssues: (params = {}) => api.get('/admin/issues', { params }),
  
  // Update issue status
  updateIssueStatus: (id, status, notes) => 
    api.put(`/admin/issues/${id}/status`, { status, notes }),
  
  // Get analytics
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
};

// Utility functions
export const generateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    // Using a free geocoding service (you might want to use Google Maps API in production)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    
    return {
      address: data.localityInfo?.administrative?.[0]?.name || 'Unknown',
      city: data.city || data.locality || 'Unknown',
      state: data.principalSubdivision || 'Unknown',
      country: data.countryName || 'Unknown',
      pincode: data.postcode || null
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      pincode: null
    };
  }
};

export default api;