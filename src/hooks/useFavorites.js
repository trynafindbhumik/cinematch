'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { mutate as globalMutate } from 'swr';

import { useGet, usePost, useDelete } from '@/lib/api';

/**
 * Hook for fetching favorites with cursor pagination
 */
export function useFavorites({ query = '', cursor = null, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const nextCursorRef = useRef(null);

  const buildUrl = useCallback(
    (cursorParam) => {
      if (query && query.length >= 2) {
        return `/v1/favorites/search?q=${encodeURIComponent(query)}${
          cursorParam ? `&cursor=${encodeURIComponent(cursorParam)}` : ''
        }`;
      }

      return `/v1/favorites${cursorParam ? `?cursor=${encodeURIComponent(cursorParam)}` : ''}`;
    },
    [query]
  );

  const url = enabled ? buildUrl(cursor) : null;

  const { data, loading, error, mutate } = useGet(url, {
    noCache: !!cursor,
  });

  /**
   * Derived value directly from SWR data
   */
  const totalCount = data?.total_count ?? 0;

  useEffect(() => {
    if (!data) return;

    const apiMovies = data.favorites || [];
    const next = data.next_cursor ?? null;

    queueMicrotask(() => {
      if (!cursor) {
        /**
         * First page / refresh
         */
        setItems(apiMovies);
      } else {
        /**
         * Append unique items only
         */
        setItems((prev) => {
          const existingIds = new Set(prev.map((movie) => movie.id));

          const newItems = apiMovies.filter((movie) => !existingIds.has(movie.id));

          return [...prev, ...newItems];
        });
      }

      nextCursorRef.current = next;

      setHasMore(!!next);
      setIsFetchingMore(false);
    });
  }, [data, cursor]);

  const fetchNextPage = useCallback(() => {
    if (isFetchingMore || !hasMore) {
      return null;
    }

    const next = nextCursorRef.current;

    if (!next) {
      setHasMore(false);
      return null;
    }

    setIsFetchingMore(true);

    /**
     * Return cursor for parent to set
     */
    return next;
  }, [hasMore, isFetchingMore]);

  const refresh = useCallback(() => {
    nextCursorRef.current = null;

    setItems([]);
    setHasMore(true);
    setIsFetchingMore(false);

    mutate();
  }, [mutate]);

  /**
   * Silent refresh that revalidates data
   * without showing loading states.
   */
  const silentRefresh = useCallback(() => {
    return globalMutate('/v1/favorites', undefined, {
      revalidate: true,
      populateCache: false,
    });
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    isFetchingMore,
    totalCount,
    fetchNextPage,
    refresh,
    silentRefresh,
  };
}

/**
 * Hook for fetching all favorite TMDB IDs
 * GET /v1/favorites/ids
 * Returns { data, error, loading, mutate }
 */
export function useFavoriteIds(options = {}) {
  return useGet('/v1/favorites/ids', options);
}

/**
 * Hook for adding movies to favorites
 * POST /v1/favorites
 * Returns [data, loading, error, trigger]
 *
 * Uses extended timeout (30s) because backend
 * may perform complex operations.
 */
export function useAddFavorites(options = {}) {
  return usePost({
    timeout: 30000,
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for removing a movie from favorites
 * DELETE /v1/favorites/{id}
 * Returns [data, loading, error, trigger]
 *
 * Uses extended timeout (30s) because backend
 * may perform complex operations.
 */
export function useRemoveFavorite(options = {}) {
  return useDelete({
    timeout: 30000,
    allowEmptyBody: true,
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for searching within favorites
 * GET /v1/favorites/search?q=...&limit=...&cursor=...
 * Returns { data, error, loading, mutate }
 */
export function useSearchFavorites(options = {}) {
  return useGet('/v1/favorites/search', {
    swrOptions: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
    ...options,
  });
}
