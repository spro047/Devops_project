import axios from 'axios';

export const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  const port = window.location.port;

  let backendPort = '5002'; // default for docker-compose
  if (port === '3001') {
    backendPort = '5001';
  } else if (port === '3000') {
    backendPort = '5002';
  } else if (port === '5173') {
    backendPort = '5000'; // local vite dev -> local flask dev
  } else if (port === '8080') {
    backendPort = '5000';
  } else if (port === '') {
    backendPort = '5002';
  }

  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? `http://127.0.0.1:${backendPort}/api`
    : `http://${hostname}:${backendPort}/api`;
})();

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
export const getTrackingDetails = (id) => api.get(`/track/${id}`);
export const updateDispatch = (id, actionData) => api.put(`/dispatch/${id}`, actionData);
export const processDispatch = () => api.post('/dispatch/process');
export const placeStoreOrder = (orderData) => api.post('/store/order', orderData);
export const moveZone = (data) => api.post('/warehouse/move', data);
export const clearOldStock = (data) => api.post('/warehouse/clear-old', data);
export const receiveShipment = (data) => api.post('/receive', data);
export const markDamage = (data) => api.post('/damage', data);

export default api;
