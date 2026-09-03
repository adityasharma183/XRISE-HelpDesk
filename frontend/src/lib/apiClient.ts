import axios, { AxiosError } from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: rawApiUrl ? `${rawApiUrl}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token from auth-storage if present as fallback alongside HttpOnly cookie
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let browser set multipart/form-data with boundary
    delete config.headers['Content-Type'];
  }

  try {
    const rawStorage = localStorage.getItem('auth-storage');
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      const token = parsed?.state?.token;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Ignore storage parsing errors
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code?: string; message?: string; details?: any } }>) => {
    const errorPayload = error.response?.data?.error;
    const customMessage = errorPayload?.message || error.message || 'An unexpected error occurred';

    return Promise.reject({
      status: error.response?.status,
      code: errorPayload?.code || 'NETWORK_ERROR',
      message: customMessage,
      details: errorPayload?.details,
      raw: error,
    });
  }
);
