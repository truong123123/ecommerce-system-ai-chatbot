import axios from 'axios';
import { API_BASE_URL } from '../lib/env';

export interface ApiErrorResponse {
  status?: number;
  message: string;
  errors?: Record<string, string>;
}

export function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const isClient = typeof window !== 'undefined';
const resolvedBaseUrl = isClient
  ? '/api/v1'
  : (process.env.BACKEND_INTERNAL_URL || API_BASE_URL || 'http://backend:8080/api/v1');

export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method || '').toLowerCase();
  if (['post', 'put', 'delete', 'patch'].includes(method)) {
    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
  }
  return config;
});

export default apiClient;
