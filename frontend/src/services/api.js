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
export const requestStock = (data) => api.post('/request', data);
export const adjustInventory = (productId, adjustment) => api.post(`/inventory/adjust/${productId}`, adjustment);
export const getWarehouseStatus = () => api.get('/warehouse/status');
export const getDispatchQueue = () => api.get('/dispatch/queue');
export const trackShipment = (id) => api.get(`/track/${id}`);
export const updateDispatch = (id, actionData) => api.put(`/dispatch/${id}`, actionData);
export const processDispatch = () => api.post('/dispatch/process');
export const moveZone = (data) => api.post('/warehouse/move', data);
export const clearOldStock = (data) => api.post('/warehouse/clear-old', data);
export const receiveShipment = (data) => api.post('/receive', data);
export const markDamage = (data) => api.post('/damage', data);

export default api;
