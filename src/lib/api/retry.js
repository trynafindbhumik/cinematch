import axios from 'axios';

import { globalConfig } from './config';

// These status codes mean the request definitively failed — retrying won't help.
// 401 is intentionally excluded: it's handled by the token refresh interceptor.
const NON_RETRYABLE_STATUS_CODES = new Set([400, 403, 404, 409, 422]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a request function with automatic retry on failure using exponential backoff.
 *
 * Will NOT retry:
 *   - Requests cancelled via AbortController
 *   - 401 errors (handled separately by the token refresh interceptor)
 *   - Status codes in NON_RETRYABLE_STATUS_CODES or extraNoRetryStatusCodes
 *
 * Backoff: retryDelay × 2^attempt  (e.g. 500ms → 1000ms → 2000ms)
 *
 * @param {() => Promise} requestFn
 * @param {{ disableRetries?: boolean, extraNoRetryStatusCodes?: number[] }} [options]
 * @returns {Promise}
 */
export async function retryRequest(requestFn, options = {}) {
  const { disableRetries = false, extraNoRetryStatusCodes = [] } = options;

  const maxAttempts = disableRetries ? 1 : globalConfig.maxRetries + 1;

  const noRetrySet =
    extraNoRetryStatusCodes.length > 0
      ? new Set([...NON_RETRYABLE_STATUS_CODES, ...extraNoRetryStatusCodes])
      : NON_RETRYABLE_STATUS_CODES;

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Aborted via AbortController — don't retry
      if (axios.isCancel(error) || error?.message === 'canceled') {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[retry] Request cancelled, not retrying:', error?.config?.url);
        }
        break;
      }

      if (attempt >= maxAttempts - 1) break;

      // 401 is managed by the token refresh interceptor — don't interfere
      const statusCode = error?.status ?? error?.response?.status;
      if (statusCode === 401) break;
      if (statusCode && noRetrySet.has(statusCode)) break;

      await sleep(globalConfig.retryDelay * Math.pow(2, attempt));
    }
  }

  throw lastError;
}
