import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
