'use client';

import axios from 'axios';

import { getCookie, setCookie } from '@/lib/cookie';

import { globalConfig, markFirstRequest } from './config';
import { normalizeError } from './utils';

// axiosInstance is created with minimal defaults.
// All dynamic values (baseURL, timeout, defaultHeaders) are applied at request time
// via the request interceptor, which reads from globalConfig.
export const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
    // Content-Type is NOT set here - it's set per-request based on payload type
    // For JSON: set in hooks.js when payload is not FormData
    // For FormData: let axios auto-set multipart boundary
  },
  withCredentials: true,
});

// Prevents multiple simultaneous token refresh requests (race condition guard)
let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(newToken, error) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(newToken)));
  refreshQueue = [];
}

/**
 * Exchanges the current refresh token for a new access token and writes
 * it back to cookies. Supports accessToken/access_token response field names.
 *
 * @returns {Promise<string>} The new access token
 * @throws {Error} If the refresh endpoint returns no access token
 */
async function performTokenRefresh() {
  const refreshToken = getCookie(globalConfig.refreshTokenKey);
  const { expires, ...cookieRest } = globalConfig.cookieOptions;

  const response = await axiosInstance.post(
    globalConfig.refreshEndpoint,
    { refreshToken },
    // _skipAuth: don't attach the (stale) access token to this request
    // _skipRefresh: don't trigger another refresh loop on 401
    { _skipAuth: true, _skipRefresh: true }
  );

  const newAccessToken = response.data?.accessToken || response.data?.access_token;
  const newRefreshToken = response.data?.refreshToken || response.data?.refresh_token;

  if (!newAccessToken) {
    throw new Error(
      '[api] Refresh endpoint did not return an access token. ' +
        'Expected `accessToken` or `access_token` in the response body.'
    );
  }

  setCookie(globalConfig.accessTokenKey, newAccessToken, expires, cookieRest);
  if (newRefreshToken) {
    setCookie(globalConfig.refreshTokenKey, newRefreshToken, expires, cookieRest);
  }

  return newAccessToken;
}

// Request interceptor: sets baseURL, attaches auth header, merges headers, applies timeout
axiosInstance.interceptors.request.use(
  (config) => {
    markFirstRequest();

    // Apply the latest baseURL from globalConfig (configureApi may have updated it)
    if (globalConfig.baseURL) {
      config.baseURL = globalConfig.baseURL;
    }

    const shouldAttachAuth = !config._skipAuth && config.withAuth !== false;
    if (shouldAttachAuth) {
      const token = getCookie(globalConfig.accessTokenKey);
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (Object.keys(globalConfig.defaultHeaders ?? {}).length > 0) {
      // Request-level headers take precedence over global defaults
      config.headers = { ...globalConfig.defaultHeaders, ...config.headers };
    }

    // _timeout is the internal per-request override; falls back to global timeout
    config.timeout = config._timeout ?? globalConfig.timeout;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: validates responses, handles 401 token refresh, normalizes errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Per-request validator takes precedence over the global one
    const validateFn = response.config?._validateResponse ?? globalConfig.validateResponse;

    if (typeof validateFn === 'function' && validateFn(response) === false) {
      // Backend returned 2xx but the response body signals failure
      const err = normalizeError({
        response: { status: response.status, data: response.data },
      });
      globalConfig.onGlobalError?.(err);
      return Promise.reject(err);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isRefreshRequest = originalRequest?._skipRefresh;
    const alreadyRetried = originalRequest?._retried401;
    const isAuthRequest = originalRequest?.withAuth === false;

    // Skip 401 refresh for auth requests (login/signup) that don't have a token attached
    if (is401 && isAuthRequest) {
      const err = normalizeError(error);
      globalConfig.onGlobalError?.(err);
      return Promise.reject(err);
    }

    if (is401 && !isRefreshRequest && !alreadyRetried) {
      originalRequest._retried401 = true;

      if (isRefreshing) {
        // A refresh is already in flight — queue this request to retry after it settles
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await performTokenRefresh();
        processRefreshQueue(newToken, null);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processRefreshQueue(null, refreshErr);
        await globalConfig.onUnauthorized?.();
        const err = normalizeError(refreshErr);
        globalConfig.onGlobalError?.(err);
        return Promise.reject(err);
      } finally {
        // Always reset the flag — even if the retry or a subsequent line throws
        isRefreshing = false;
      }
    }

    const err = normalizeError(error);
    globalConfig.onGlobalError?.(err);
    return Promise.reject(err);
  }
);
