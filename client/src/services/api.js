import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling & standardized responses
api.interceptors.response.use(
  (response) => {
    // Return standard data payload if backend returns { success: true, data: ... }
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('quickcart_token');
      localStorage.removeItem('quickcart_user');
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

// --- Auth APIs ---
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// --- Store & Product Catalog APIs ---
export const storesApi = {
  getStores: (params = {}) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  getStoreProducts: (storeId, params = {}) =>
    api.get(`/stores/${storeId}/products`, { params }),
};

// --- Store Partner Management APIs ---
export const partnerApi = {
  getProducts: (params = {}) => api.get('/partner/products', { params }),
  addProduct: (productData) => api.post('/partner/products', productData),
  updateProduct: (id, productData) => api.put(`/partner/products/${id}`, productData),
  updateStock: (id, stock_qty) => api.patch(`/partner/products/${id}/stock`, { stock_qty }),
  toggleActive: (id) => api.patch(`/partner/products/${id}/toggle-active`),
  deleteProduct: (id) => api.delete(`/partner/products/${id}`),
};

// --- Orders & State Machine APIs ---
export const ordersApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, { status, reason }) =>
    api.patch(`/orders/${id}/status`, { status, reason }),
};

// --- Platform Admin APIs ---
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getTransactions: (params = {}) => api.get('/admin/transactions', { params }),
  getZones: () => api.get('/admin/zones'),
  createZone: (zoneData) => api.post('/admin/zones', zoneData),
  updateZone: (id, zoneData) => api.put(`/admin/zones/${id}`, zoneData),
  assignToZone: (id, assignData) => api.post(`/admin/zones/${id}/assign`, assignData),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
};

export default api;
