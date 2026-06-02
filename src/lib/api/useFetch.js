'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import api, { normalizeError } from './axios';

/**
 * Reactive GET hook. Pass null/undefined url to skip the request.
 * Returns { data, error, loading, refetch }.
 */
export function useFetch(url, { withAuth = true, skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (skip || !url) return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!aliveRef.current) return;
      setLoading(true);
      setError(null);
    });

    api
      .get(url, { withAuth, signal: controller.signal })
      .then((res) => {
        if (!aliveRef.current) return;
        if (controller.signal.aborted) return;
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (!aliveRef.current) return;
        const norm = err && err.status !== undefined ? err : normalizeError(err);
        setError(norm);
        setLoading(false);
      });

    return () => controller.abort();
  }, [url, withAuth, skip, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, loading, refetch };
}
