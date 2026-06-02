'use client';

import { useCallback, useState, useMemo } from 'react';

import { useFetch } from '@/lib/api';
import api from '@/lib/api/axios';

/**
 * Hook for fetching favorites with cursor pagination.
 */
export function useFavorites({ query = '', cursor = null, enabled = true } = {}) {
  const url = useMemo(() => {
    if (!enabled) return null;
    if (query && query.length >= 2) {
      return `/v1/favorites/search?q=${encodeURIComponent(query)}${
        cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
      }`;
    }
    return `/v1/favorites${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`;
  }, [query, cursor, enabled]);

  const { data, error, loading, refetch } = useFetch(url, { skip: !enabled });

  const items = data?.favorites || [];
  const nextCursor = data?.next_cursor ?? null;
  const hasMore = !!nextCursor;
  const totalCount = data?.total_count ?? 0;

  return {
    items,
    loading,
    error,
    hasMore,
    nextCursor,
    totalCount,
    fetchNextPage: () => nextCursor,
    refresh: refetch,
    silentRefresh: refetch,
  };
}

export function useFavoriteIds() {
  return useFetch('/v1/favorites/ids');
}

export function useAddFavorites() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload, { timeout: 30000 });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useRemoveFavorite() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(url, { timeout: 30000 });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useSearchFavorites() {
  return useFetch('/v1/favorites/search');
}
