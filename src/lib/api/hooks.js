'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';

import { axiosInstance } from './client';
import { globalConfig } from './config';
import { retryRequest } from './retry';
import { normalizeError, buildFormData, resolveUrl } from './utils';

/**
 * SWR-powered GET hook with caching, deduplication, auth, retry,
 * and AbortController-based cancellation on unmount.
 *
 * Pass `null` as the URL to suspend fetching (conditional fetch pattern).
 *
 * @param {string | null} url - API endpoint; pass null to skip the request
 * @param {Object}   [options]
 * @param {boolean}  [options.withAuth=true]            - Attach Authorization header
 * @param {number}   [options.timeout]                  - Per-request timeout override in ms
 * @param {boolean}  [options.disableRetries=false]     - Skip retry logic for this request
 * @param {number[]} [options.extraNoRetryStatusCodes]  - Additional codes that won't be retried
 * @param {boolean}  [options.noCache=false]            - Always fetch fresh, skip dedup window
 * @param {Object}   [options.swrOptions]               - Passed directly to useSWR (e.g. { refreshInterval: 5000 })
 * @param {Function} [options.validateResponse]         - Per-request response validator
 * @returns {{ data: any, error: object|null, loading: boolean, mutate: Function }}
 *
 * @example — Conditional fetch
 *   const { data } = useGet(userId ? `/api/users/${userId}` : null);
 *
 * @example — Poll every 5 seconds
 *   const { data } = useGet('/api/status', { swrOptions: { refreshInterval: 5000 } });
 */
export function useGet(url, options = {}) {
  const {
    withAuth = true,
    timeout,
    disableRetries = false,
    extraNoRetryStatusCodes = [],
    noCache = false,
    swrOptions = {},
    validateResponse: perRequestValidate,
  } = options;

  const fetcher = useCallback(
    async (fetchUrl) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[useGet] Fetching:', fetchUrl);
      }

      const startTime = Date.now();
      const response = await retryRequest(
        () =>
          axiosInstance.get(fetchUrl, {
            withAuth,
            _timeout: timeout,
            _validateResponse: perRequestValidate,
          }),
        { disableRetries, extraNoRetryStatusCodes }
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[useGet] Finished: ${fetchUrl} in ${Date.now() - startTime}ms`);
      }

      return response.data;
    },
    [withAuth, timeout, perRequestValidate, disableRetries, extraNoRetryStatusCodes]
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR(url, fetcher, {
    ...globalConfig.swrDefaults,
    ...(noCache
      ? { revalidateOnFocus: false, revalidateOnReconnect: false, dedupingInterval: 0 }
      : {}),
    ...swrOptions,
    shouldRetryOnError: false, // always forced — retryRequest handles retries
  });

  return {
    data: data ?? null,
    error: error ?? null,
    loading: isLoading || isValidating,
    mutate,
  };
}

/**
 * Internal hook shared by usePost, usePut, usePatch, and useDelete.
 * Returns [data, loading, error, trigger].
 *
 * @param {string} method
 * @param {Object} hookOptions
 */
function useMutation(method, hookOptions = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  // Update the ref synchronously each render so trigger() always sees
  // the latest hookOptions without becoming stale. Ref updates don't cause re-renders.
  const hookOptionsRef = useRef(hookOptions);
  useEffect(() => {
    hookOptionsRef.current = hookOptions;
  });

  useEffect(() => {
    const controller = abortRef.current;
    return () => controller?.abort();
  }, []);

  /**
   * Executes the mutation. Fully awaitable — resolves with response data
   * or throws a normalized error.
   *
   * @param {string | (() => string)} url     - Endpoint or factory function
   * @param {any}    [payload]                - Request body
   * @param {Object} [callOptions]            - Per-call overrides (take precedence over hookOptions)
   * @returns {Promise<any>}
   */
  const trigger = useCallback(
    async (url, payload, callOptions = {}) => {
      // Merge: call-time options take precedence over hook-level options
      const opts = { ...hookOptionsRef.current, ...callOptions };
      const {
        asFormData = false,
        allowEmptyBody = false,
        timeout,
        withAuth = true,
        disableRetries = false,
        extraNoRetryStatusCodes = [],
        onUploadProgress,
        validateResponse: perRequestValidate,
        onSuccess,
        onError,
      } = opts;

      const keysToRevalidate = opts.revalidateKeys ?? [];

      if (process.env.NODE_ENV === 'development') {
        if (!url) {
          // eslint-disable-next-line no-console
          console.warn(
            `[api] ${method.toUpperCase()} trigger() called with a null/undefined URL. Request aborted.`
          );
          return undefined;
        }
        if (!allowEmptyBody && payload === null && method !== 'delete') {
          // eslint-disable-next-line no-console
          console.warn(
            `[api] ${method.toUpperCase()} trigger() called without a payload. ` +
              'Pass { allowEmptyBody: true } as an option if this is intentional.'
          );
        }
      }

      // Cancel any previous in-flight request from this hook instance
      const optsWithDisableAbort = hookOptionsRef.current;
      if (!optsWithDisableAbort.disableAbort) {
        abortRef.current?.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      let requestData = payload;
      const extraHeaders = {};

      if (payload !== null) {
        if (asFormData) {
          requestData = buildFormData(payload);
          // Don't set Content-Type - axios will auto-set multipart boundary for FormData
        } else {
          extraHeaders['Content-Type'] = 'application/json';
        }
      } else if (!allowEmptyBody) {
        requestData = undefined;
      }

      try {
        const response = await retryRequest(
          () =>
            axiosInstance({
              method,
              url: resolveUrl(url),
              data: requestData,
              headers: extraHeaders,
              signal: controller.signal,
              withAuth,
              _timeout: timeout,
              _validateResponse: perRequestValidate,
              onUploadProgress: onUploadProgress
                ? ({ loaded, total }) => {
                    const percent = total ? Math.round((loaded / total) * 100) : 0;
                    onUploadProgress({ percent, loaded, total: total ?? 0 });
                  }
                : undefined,
            }),
          { disableRetries, extraNoRetryStatusCodes }
        );

        if (controller.signal.aborted) return undefined;

        const responseData = response.data;
        setData(responseData);
        setLoading(false);
        setError(null);

        onSuccess?.(responseData);

        if (keysToRevalidate.length > 0) {
          await Promise.all(
            keysToRevalidate.map((key) =>
              globalMutate(key, undefined, { revalidate: true, populateCache: false })
            )
          );
        }

        return responseData;
      } catch (err) {
        if (controller.signal.aborted) return undefined;

        // The interceptor may have already normalized the error
        const normalizedErr =
          err?.status !== undefined &&
          err?.data !== undefined &&
          err?.message !== undefined &&
          !err.isAxiosError
            ? err
            : normalizeError(err);

        setError(normalizedErr);
        setLoading(false);
        onError?.(normalizedErr);

        throw normalizedErr;
      }
    },
    [method] // stable — state setters and refs don't change across renders
  );

  return [data, loading, error, trigger];
}

// Mutation hooks

/**
 * Hook for POST requests. Use for resource creation.
 * Returns [data, loading, error, trigger].
 *
 * @param {Object}   [hookOptions]
 * @param {boolean}  [hookOptions.withAuth=true]
 * @param {number}   [hookOptions.timeout]
 * @param {boolean}  [hookOptions.asFormData=false]     - Send as multipart/form-data
 * @param {boolean}  [hookOptions.allowEmptyBody=false]
 * @param {boolean}  [hookOptions.disableRetries=false]
 * @param {number[]} [hookOptions.extraNoRetryStatusCodes]
 * @param {string[]} [hookOptions.revalidateKeys]       - SWR keys to revalidate on success
 * @param {Function} [hookOptions.onSuccess]            - (data) => void
 * @param {Function} [hookOptions.onError]              - (normalizedError) => void
 * @returns {[any, boolean, object|null, Function]}
 *
 * @example
 *   const [, loading, , trigger] = usePost({
 *     revalidateKeys: ['/api/users'],
 *     onSuccess: () => toast.success('Created!'),
 *   });
 *   const user = await trigger('/api/users', { name: 'Alice' });
 *
 * @example — File upload with progress
 *   await trigger('/api/avatar', { file: selectedFile }, {
 *     asFormData: true,
 *     onUploadProgress: ({ percent }) => setProgress(percent),
 *   });
 */
export function usePost(hookOptions = {}) {
  return useMutation('post', hookOptions);
}

/**
 * Hook for PUT requests. Use for full resource replacement.
 * Returns [data, loading, error, trigger].
 *
 * @param {Object} [hookOptions] - Same options as usePost
 * @returns {[any, boolean, object|null, Function]}
 */
export function usePut(hookOptions = {}) {
  return useMutation('put', hookOptions);
}

/**
 * Hook for PATCH requests. Use for partial resource updates.
 * Returns [data, loading, error, trigger].
 *
 * @param {Object} [hookOptions] - Same options as usePost
 * @returns {[any, boolean, object|null, Function]}
 */
export function usePatch(hookOptions = {}) {
  return useMutation('patch', hookOptions);
}

/**
 * Hook for DELETE requests.
 * For deletes with no body, pass null as payload and { allowEmptyBody: true }.
 * Returns [data, loading, error, trigger].
 *
 * @param {Object} [hookOptions] - Same options as usePost
 * @returns {[any, boolean, object|null, Function]}
 *
 * @example — Simple delete (no body)
 *   await trigger(`/api/users/${id}`, null, { allowEmptyBody: true });
 *
 * @example — Bulk delete with body
 *   await trigger('/api/users/bulk', { ids: [1, 2, 3] });
 */
export function useDelete(hookOptions = {}) {
  return useMutation('delete', hookOptions);
}
