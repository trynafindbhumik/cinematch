'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useGet } from '@/lib/api';

export default function useWatchlist({ query = '', genre = null, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const nextCursorRef = useRef(null);
  const debounceRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsDebouncing(true);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Reset when query or genre changes
  useEffect(() => {
    setItems([]);
    setCursor(null);
    nextCursorRef.current = null;
    setHasMore(true);
  }, [debouncedQuery, genre]);

  const buildUrl = useCallback(
    (cursorValue) => {
      if (debouncedQuery && debouncedQuery.length >= 2) {
        return `/v1/watchlist/search?q=${encodeURIComponent(debouncedQuery)}${
          cursorValue ? `&cursor=${encodeURIComponent(cursorValue)}` : ''
        }`;
      }

      return `/v1/watchlist${genre ? `?genre=${encodeURIComponent(genre)}` : ''}${
        cursorValue ? `${genre ? '&' : '?'}cursor=${encodeURIComponent(cursorValue)}` : ''
      }`;
    },
    [debouncedQuery, genre]
  );

  const url = enabled ? buildUrl(cursor) : null;

  const { data, loading, error, mutate } = useGet(url, { noCache: !!cursor });

  useEffect(() => {
    if (!data) return;

    const apiMovies = data.movies || [];

    queueMicrotask(() => {
      if (!cursor) {
        setItems(apiMovies);
      } else {
        const existingIds = new Set(items.map((m) => m.id));
        const newOnes = apiMovies.filter((m) => !existingIds.has(m.id));
        setItems((prev) => [...prev, ...newOnes]);
      }

      const next = data.next_cursor ?? null;
      nextCursorRef.current = next;
      setHasMore(!!next);
      setIsFetchingMore(false);
      setIsDebouncing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    const next = nextCursorRef.current;
    if (!next) {
      setHasMore(false);
      return;
    }

    setIsFetchingMore(true);
    setCursor(next);
  }, [hasMore, isFetchingMore]);

  const refresh = useCallback(() => {
    setItems([]);
    setCursor(null);
    nextCursorRef.current = null;
    setHasMore(true);
    setIsFetchingMore(false);
    mutate();
  }, [mutate]);

  return {
    items,
    loading,
    error,
    hasMore,
    isFetchingMore,
    fetchNextPage,
    refresh,
    isDebouncing,
  };
}
