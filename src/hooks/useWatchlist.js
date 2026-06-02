'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import api from '@/lib/api/axios';

const initialState = {
  items: [],
  cursor: null,
  hasMore: true,
  isFetchingMore: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...initialState };
    case 'FETCH_MORE':
      return { ...state, cursor: action.payload, isFetchingMore: true };
    case 'DATA_RECEIVED': {
      const { apiMovies, nextCursor, isFirstPage } = action.payload;
      const items = isFirstPage
        ? apiMovies
        : (() => {
            const ids = new Set(state.items.map((m) => m.id));
            return [...state.items, ...apiMovies.filter((m) => !ids.has(m.id))];
          })();
      return {
        ...state,
        items,
        hasMore: !!nextCursor,
        isFetchingMore: false,
      };
    }
    default:
      return state;
  }
}

export default function useWatchlist({ query = '', genre = null, enabled = true } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, cursor, hasMore, isFetchingMore } = state;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef(null);
  const isDebouncing = query.trim() !== debouncedQuery;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Hard reset: triggered by query/genre change. Clears items.
  useEffect(() => {
    dispatch({ type: 'RESET' });
    nextCursorRef.current = null;
  }, [debouncedQuery, genre]);

  const nextCursorRef = useRef(null);
  const isFirstPageRef = useRef(true);

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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return undefined;
    const controller = new AbortController();
    // Snapshot: this fetch is a "first page" if URL has no cursor.
    // Used by the data effect to decide replace vs append.
    isFirstPageRef.current = !url.includes('cursor=');
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    api
      .get(url, { signal: controller.signal })
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
  }, [url, tick]);

  useEffect(() => {
    if (!data) return;
    const apiMovies = data.movies || [];
    const nextCursor = data.next_cursor ?? null;
    const isFirstPage = isFirstPageRef.current;
    queueMicrotask(() => {
      dispatch({ type: 'DATA_RECEIVED', payload: { apiMovies, nextCursor, isFirstPage } });
      nextCursorRef.current = nextCursor;
    });
  }, [data]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    const next = nextCursorRef.current;
    if (!next) return;
    dispatch({ type: 'FETCH_MORE', payload: next });
  }, [hasMore, isFetchingMore]);

  // Soft refresh: re-fetch the current page WITHOUT clearing items.
  // UI keeps showing existing items while loading; new data replaces them.
  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const silentRefresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    isFetchingMore,
    fetchNextPage,
    refresh,
    silentRefresh,
    isDebouncing,
  };
}

export function useAddToWatchlist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToWatchlist = useCallback(async (tmdbIds) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/watchlist', { tmdb_ids: tmdbIds }, { timeout: 30000 });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { addToWatchlist, loading, error };
}

export function useRemoveFromWatchlist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeFromWatchlist = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/v1/watchlist/${id}`);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { removeFromWatchlist, loading, error };
}
