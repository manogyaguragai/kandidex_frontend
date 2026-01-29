import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Some endpoints need user_id as query param or in body, but access token handles auth.
    // However, the backend seems to expect user_id in query/body often.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect if it's a login attempt (let the component handle the error)
    if (error.response?.status === 401 && !error.config.url?.endsWith('/login') && !error.config.url?.includes('/token') && !error.config.url?.endsWith('/reset-password')) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('limit')) {
      // Dispatch a custom event that the UI can listen to
      window.dispatchEvent(new CustomEvent('kandidex:limit-reached', { 
        detail: error.response.data 
      }));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
