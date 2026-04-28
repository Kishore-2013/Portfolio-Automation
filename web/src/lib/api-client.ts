import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG } from '@/config/api.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    const publicRoutes = ['/auth/register', '/auth/login', '/auth/refresh'];
    const isPublicRoute = publicRoutes.some(route => config.url?.endsWith(route));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicRoute) {
      console.warn(`[apiClient] ⚠️ No access token found in store for request: ${config.url}`);
    }
    return config;

  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the standard ApiResponse format if present
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying (to avoid infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // API returns { success: true, data: { accessToken: "..." } }
        const { accessToken } = response.data.data;
        
        // Update store
        const { user, setAuth } = useAuthStore.getState();
        if (user) {
          setAuth(user, accessToken);
        }

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

