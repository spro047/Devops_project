import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardData = () => api.get('/dashboard');
export const getProducts = () => api.get('/products');
export const getTransactions = () => api.get('/transactions');
export const addProduct = (productData) => api.post('/product', productData);
export const adjustInventory = (productId, adjustment) => api.post(`/inventory/adjust/${productId}`, adjustment);

export default api;
