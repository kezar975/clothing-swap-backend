import axios from 'axios';
const API_BASE = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE, 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
};

export const clothingAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/clothes?${params}`);
  },
  getById: (id) => api.get(`/clothes/${id}`),
  create: (data) => api.post('/clothes', data),
  update: (id, data) => api.put(`/clothes/${id}`, data),
  delete: (id) => api.delete(`/clothes/${id}`)
};

export const swapAPI = {
  getAll: () => api.get('/swaps'),
  create: (data) => api.post('/swaps', data),
  getById: (id) => api.get(`/swaps/${id}`),
  updateStatus: (id, status) => api.patch(`/swaps/${id}/status`, { status }),
  sendMessage: (swapId, message) => api.post(`/swaps/${swapId}/message`, { message }),
  getMessages: (swapId) => api.get(`/swaps/${swapId}/messages`)
};

export const courierAPI = {
  createOrUpdate: (swapId, data) => api.post(`/courier/${swapId}`, data),
  get: (swapId) => api.get(`/courier/${swapId}`),
  updateStatus: (swapId, status) => api.patch(`/courier/${swapId}/status`, { shippingStatus: status }),
  getSuggestions: () => api.get('/courier/suggestions')
};

export const statsAPI = {
  getMyStats: () => api.get('/stats/my'),
  getPlatformStats: () => api.get('/stats/platform'),
  updateStats: (userId, swapCompleted) => api.post('/stats/update', { userId, swapCompleted }),
  getLeaderboard: () => api.get('/stats/leaderboard')
};