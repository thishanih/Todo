import axios from 'axios';

interface ApiErrorResponse {
  error?: string;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;

  if (apiKey) {
    config.headers.set('x-api-key', apiKey);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const message = error.response?.data?.error ?? error.message;
      return Promise.reject(new Error(message, { cause: error }));
    }

    return Promise.reject(error);
  },
);
