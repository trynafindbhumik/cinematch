'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api/axios';

/**
 * Hook for searching movies by query.
 * Pass null/empty query to skip the request.
 * Returns { data, error, loading }.
 */
export function useMovieSearch(query) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });

    api
      .get(`/v1/movies/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
      .then((res) => {
        if (controller.signal.aborted) return;
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  return { data, error, loading };
}
