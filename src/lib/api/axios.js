'use client';

import axios from 'axios';

import { getCookie, setCookie, removeCookie } from '@/lib/cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const REFRESH_ENDPOINT = '/v1/auth/refresh';
const COOKIE_EXPIRES_DAYS = 7;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: { Accept: 'application/json' },
  withCredentials: true,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  if (config._skipAuth) return config;
  const token = getCookie(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Convert any error into { status, data, message }.
 */
function normalizeError(err) {
  if (err && 'status' in err && 'data' in err && 'message' in err && !err.isAxiosError) {
    return err;
  }

  const status = err?.response?.status ?? null;
  const data = err?.response?.data ?? null;

  const message =
    (typeof data === 'string' && data) ||
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) && (data.errors[0]?.message || data.errors[0])) ||
    err?.message ||
    (status
      ? `Request failed with status ${status}`
      : 'Network error. Please check your connection.');

  return { status, data, message };
}

let isRefreshing = false;
let refreshQueue = [];

function processQueue(newToken, error) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(newToken)));
  refreshQueue = [];
}

async function refreshTokens() {
  const refreshToken = getCookie(REFRESH_TOKEN_KEY);
  const res = await api.post(
    REFRESH_ENDPOINT,
    { refreshToken },
    { _skipAuth: true, _skipRefresh: true }
  );

  const newAccess = res.data?.accessToken || res.data?.access_token;
  const newRefresh = res.data?.refreshToken || res.data?.refresh_token;

  if (!newAccess) {
    throw new Error('Refresh endpoint did not return an access token.');
  }

  setCookie(ACCESS_TOKEN_KEY, newAccess, COOKIE_EXPIRES_DAYS);
  if (newRefresh) {
    setCookie(REFRESH_TOKEN_KEY, newRefresh, COOKIE_EXPIRES_DAYS);
  }

  return newAccess;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;
    const isAuthRequest = original?.withAuth === false;
    const isRefreshRequest = original?._skipRefresh;
    const alreadyRetried = original?._retried401;

    if (is401 && isAuthRequest) {
      return Promise.reject(normalizeError(error));
    }

    if (is401 && !isRefreshRequest && !alreadyRetried) {
      original._retried401 = true;

      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch (e) {
          return Promise.reject(normalizeError(e));
        }
      }

      isRefreshing = true;
      try {
        const newToken = await refreshTokens();
        processQueue(newToken, null);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(null, refreshErr);
        if (typeof window !== 'undefined') {
          removeCookie(ACCESS_TOKEN_KEY);
          removeCookie(REFRESH_TOKEN_KEY);
          removeCookie('is_verified');
          removeCookie('needs_onboarding');
          window.location.href = '/login';
        }
        return Promise.reject(normalizeError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
export { normalizeError };
