'use client';

import { removeCookie } from '@/lib/cookie';

/**
 * @typedef {Object} ApiConfig
 * @property {string}   baseURL           - Base URL for all requests
 * @property {Object}   defaultHeaders    - Headers merged into every request
 * @property {number}   timeout           - Global request timeout in ms
 * @property {number}   maxRetries        - Max automatic retry attempts
 * @property {number}   retryDelay        - Base backoff delay in ms (doubles per attempt)
 * @property {string}   accessTokenKey    - Cookie key for the access token
 * @property {string}   refreshTokenKey   - Cookie key for the refresh token
 * @property {Object}   cookieOptions     - Cookie write options ({ expires, path, secure, sameSite })
 * @property {string}   refreshEndpoint   - API path for the token refresh endpoint
 * @property {Function} onUnauthorized    - Called when refresh fails; remove tokens and redirect
 * @property {Function} onGlobalError     - Called with every normalized error; useful for logging
 * @property {Object}   swrDefaults       - SWR global options applied to every useGet call
 * @property {Function} validateResponse  - Return false to treat a 2xx response as an error
 */

const DEFAULT_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  defaultHeaders: {},
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 500,
  accessTokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  cookieOptions: {
    expires: 7,
    path: '/',
    secure: true,
    sameSite: 'Strict',
  },
  refreshEndpoint: '/v1/auth/refresh',
  onUnauthorized: null,
  onGlobalError: null,
  swrDefaults: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    shouldRetryOnError: false,
  },
  validateResponse: null,
};

/**
 * Mutable global config object. Mutated in place by configureApi() so all
 * modules that import this reference always see the latest values at call time.
 *
 * @type {ApiConfig}
 */
export const globalConfig = {
  ...DEFAULT_CONFIG,
  // Default: clear cookies and reload. Replaced by configureApi() if provided.
  onUnauthorized: async () => {
    removeCookie(globalConfig.accessTokenKey);
    removeCookie(globalConfig.refreshTokenKey);
    if (typeof window !== 'undefined') window.location.reload();
  },
};

// Used only for a dev-mode warning when configureApi is called too late
let firstRequestDispatched = false;

export function markFirstRequest() {
  firstRequestDispatched = true;
}

/**
 * Merges config overrides into the global API configuration.
 * Call once at app startup before any request is made — at module level
 * in your providers file, not inside useEffect.
 *
 * Nested objects (defaultHeaders, cookieOptions, swrDefaults) are merged,
 * not replaced, so you can override individual keys without losing defaults.
 *
 * @param {Partial<ApiConfig>} config
 *
 * @example
 * configureApi({
 *   timeout: 15000,
 *   onUnauthorized: async () => router.push('/login'),
 *   swrDefaults: { revalidateOnFocus: false },
 * });
 */
export function configureApi(config = {}) {
  if (process.env.NODE_ENV === 'development' && firstRequestDispatched) {
    // eslint-disable-next-line no-console
    console.warn(
      '[api] configureApi() was called after requests have already been made. ' +
        'Call it at module level in your providers file, not inside useEffect.'
    );
  }

  Object.assign(globalConfig, config, {
    // Merge nested objects so partial overrides don't wipe out defaults
    defaultHeaders: { ...globalConfig.defaultHeaders, ...config.defaultHeaders },
    cookieOptions: { ...globalConfig.cookieOptions, ...config.cookieOptions },
    swrDefaults: { ...globalConfig.swrDefaults, ...config.swrDefaults },
    // Preserve existing functions if not explicitly replaced
    onUnauthorized: config.onUnauthorized ?? globalConfig.onUnauthorized,
    onGlobalError: config.onGlobalError ?? globalConfig.onGlobalError,
    validateResponse: config.validateResponse ?? globalConfig.validateResponse,
  });
}
