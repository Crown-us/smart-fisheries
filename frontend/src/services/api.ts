import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// In local dev, target our Spring Boot backend. Fallback to current domain.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expired and unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken } = res.data;
          
          // Update store tokens
          const user = useAuthStore.getState().user;
          if (user) {
            useAuthStore.getState().setAuth(user, accessToken, refreshToken);
          }
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired too, logout user
          useAuthStore.getState().logout();
        }
      } else {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ==========================================
// ENDPOINT SERVICES
// ==========================================

export const authService = {
  register: (data: any) => api.post('/api/auth/register', data).then(r => r.data),
  login: (data: any) => api.post('/api/auth/login', data).then(r => r.data),
  changePassword: (data: any) => api.post('/api/auth/change-password', data).then(r => r.data),
};

export const pondService = {
  listPonds: () => api.get('/api/farmer/ponds').then(r => r.data),
  getPond: (id: number) => api.get(`/api/farmer/ponds/${id}`).then(r => r.data),
  createPond: (data: any) => api.post('/api/farmer/ponds', data).then(r => r.data),
  updatePond: (id: number, data: any) => api.put(`/api/farmer/ponds/${id}`, data).then(r => r.data),
  deletePond: (id: number) => api.delete(`/api/farmer/ponds/${id}`).then(r => r.data),
  stockPond: (pondId: number, data: any) => api.post(`/api/farmer/ponds/${pondId}/stock`, data).then(r => r.data),
  harvestPond: (pondId: number, stockId: number) => api.put(`/api/farmer/ponds/${pondId}/stock/${stockId}/harvest`).then(r => r.data),
  updateWeight: (stockId: number, weightG: number, quantity?: number) => 
    api.put(`/api/farmer/stock/${stockId}/weight?weightG=${weightG}${quantity ? `&quantity=${quantity}` : ''}`).then(r => r.data),
  listFishSpecies: () => api.get('/api/farmer/fish-species').then(r => r.data),
};

export const waterQualityService = {
  recordWater: (pondId: number, data: any) => api.post(`/api/farmer/ponds/${pondId}/water-quality`, data).then(r => r.data),
  getLatest: (pondId: number) => api.get(`/api/farmer/ponds/${pondId}/water-quality/latest`).then(r => r.data),
  getHistory: (pondId: number, days = 7) => api.get(`/api/farmer/ponds/${pondId}/water-quality/history?days=${days}`).then(r => r.data),
};

export const feedingService = {
  recordFeeding: (stockId: number, data: any) => api.post(`/api/farmer/stock/${stockId}/feeding`, data).then(r => r.data),
  getFeedingHistory: (stockId: number) => api.get(`/api/farmer/stock/${stockId}/feeding`).then(r => r.data),
  listSchedules: (pondId: number) => api.get(`/api/farmer/ponds/${pondId}/feeding-schedules`).then(r => r.data),
  createSchedule: (pondId: number, data: any) => api.post(`/api/farmer/ponds/${pondId}/feeding-schedules`, data).then(r => r.data),
  updateSchedule: (scheduleId: number, data: any) => api.put(`/api/farmer/feeding-schedules/${scheduleId}`, data).then(r => r.data),
  deleteSchedule: (scheduleId: number) => api.delete(`/api/farmer/feeding-schedules/${scheduleId}`).then(r => r.data),
  listFeedTypes: () => api.get('/api/farmer/feed-types').then(r => r.data),
};

export const fcrService = {
  getReport: (stockId: number) => api.get(`/api/farmer/stock/${stockId}/fcr/report`).then(r => r.data),
  getHistory: (stockId: number) => api.get(`/api/farmer/stock/${stockId}/fcr/history`).then(r => r.data),
};

export const certificationService = {
  submitCert: (data: any) => api.post('/api/farmer/certifications', data).then(r => r.data),
  getFarmerCerts: () => api.get('/api/farmer/certifications').then(r => r.data),
  listPending: () => api.get('/api/admin/certifications/pending').then(r => r.data),
  reviewCert: (certId: number, status: 'APPROVED' | 'REJECTED', reviewNotes: string) => 
    api.put(`/api/admin/certifications/${certId}/review`, { status, reviewNotes }).then(r => r.data),
};

export const marketplaceService = {
  browseProducts: (query?: string, category?: string) => {
    let url = '/api/auth/marketplace/products';
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    const queryString = params.toString();
    return api.get(queryString ? `${url}?${queryString}` : url).then(r => r.data);
  },
  getProduct: (id: number) => api.get(`/api/auth/marketplace/products/${id}`).then(r => r.data),
  createProduct: (data: any) => api.post('/api/farmer/products', data).then(r => r.data),
  updateProduct: (id: number, data: any) => api.put(`/api/farmer/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: number) => api.delete(`/api/farmer/products/${id}`).then(r => r.data),
  listFarmerCatalog: () => api.get('/api/farmer/products').then(r => r.data),
  checkoutOrder: (data: any) => api.post('/api/consumer/orders', data).then(r => r.data),
  getConsumerOrders: () => api.get('/api/consumer/orders').then(r => r.data),
  getOrderDetails: (orderId: number) => api.get(`/api/orders/${orderId}`).then(r => r.data),
  updateOrderStatus: (orderId: number, status: string) => api.put(`/api/farmer/orders/${orderId}/status?status=${status}`).then(r => r.data),
};

export const analyticsService = {
  getPublicStats: () => api.get('/api/auth/marketplace/analytics').then(r => r.data),
  getAdminStats: () => api.get('/api/admin/analytics').then(r => r.data),
};

export const notificationService = {
  listNotifications: () => api.get('/api/notifications').then(r => r.data),
  listUnread: () => api.get('/api/notifications/unread').then(r => r.data),
  markRead: (id: number) => api.put(`/api/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.put('/api/notifications/read-all').then(r => r.data),
};

export const adminService = {
  listUsers: () => api.get('/api/admin/users').then(r => r.data),
  verifyFarmer: (userId: number) => api.put(`/api/admin/users/${userId}/verify`).then(r => r.data),
  moderateProduct: (productId: number, status: 'APPROVED' | 'REJECTED') => 
    api.put(`/api/admin/products/${productId}/moderate?status=${status}`).then(r => r.data),
};
