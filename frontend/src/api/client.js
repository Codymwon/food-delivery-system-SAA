import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let latestTelemetry = {
  lastEndpoint: null,
  lastServedBy: null,
  lastCacheStatus: null,
  lastTimestamp: null,
  history: [],
};

const telemetryListeners = new Set();

export function onTelemetryUpdate(callback) {
  telemetryListeners.add(callback);
  return () => {
    telemetryListeners.delete(callback);
  };
}

export function getLatestTelemetry() {
  return { ...latestTelemetry };
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fooddash_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const elapsedMs = response.config?.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : 0;

    const servedBy = response.headers['x-served-by'] || response.headers['hostname'] || null;
    const cacheStatus = response.headers['x-cache'] || null;

    const eventData = {
      endpoint: response.config?.url || '',
      method: (response.config?.method || 'GET').toUpperCase(),
      status: response.status,
      elapsedMs,
      servedBy,
      cacheStatus,
      timestamp: new Date().toISOString(),
    };

    latestTelemetry = {
      lastEndpoint: eventData.endpoint,
      lastServedBy: eventData.servedBy,
      lastCacheStatus: eventData.cacheStatus,
      lastTimestamp: eventData.timestamp,
      history: [eventData, ...latestTelemetry.history.slice(0, 19)],
    };

    telemetryListeners.forEach((listener) => {
      try {
        listener(latestTelemetry);
      } catch (err) {
        console.error('[Telemetry] Listener error:', err);
      }
    });

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function fetchSystemHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export async function fetchRestaurants(params = {}) {
  const response = await apiClient.get('/restaurants', { params });
  return {
    restaurants: response.data.restaurants || [],
    servedBy: response.headers['x-served-by'] || response.data.servedBy,
    cacheStatus: response.headers['x-cache'] || 'MISS',
  };
}

export async function fetchRestaurantMenu(restaurantId) {
  const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
  return {
    ...response.data,
    servedBy: response.headers['x-served-by'] || response.data.servedBy,
    cacheStatus: response.headers['x-cache'] || 'MISS',
  };
}

export async function createOrder(orderData) {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
}

export async function fetchOrderById(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

export async function fetchUserOrders(userId) {
  const response = await apiClient.get(`/orders/user/${userId}`);
  return response.data;
}

export async function fetchDeliveryTracking(orderId) {
  const response = await apiClient.get(`/delivery/track/${orderId}`);
  return response.data;
}

export async function updateDeliveryStatus(orderId, statusData) {
  const response = await apiClient.patch(`/delivery/status/${orderId}`, statusData);
  return response.data;
}

export async function fetchOrderNotifications(orderId) {
  const response = await apiClient.get(`/notifications/order/${orderId}`);
  return response.data;
}

export async function submitReview(reviewData) {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
}

export async function fetchRestaurantReviews(restaurantId) {
  const response = await apiClient.get(`/reviews/restaurant/${restaurantId}`);
  return response.data;
}

export default apiClient;

