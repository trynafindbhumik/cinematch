'use client';

import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import { mutate as globalMutate } from 'swr';

import { useGet } from '@/lib/api';

// ─── Reducer ─────────────────────────────────────────────────────────────────

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
      const merged = isFirstPage
        ? apiMovies
        : (() => {
            const ids = new Set(state.items.map((m) => m.id));
            return [...state.items, ...apiMovies.filter((m) => !ids.has(m.id))];
          })();
      return {
        ...state,
        items: merged,
        hasMore: !!nextCursor,
        isFetchingMore: false,
      };
    }

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export default function useWatched({ query = '', genre = null, enabled = true } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, cursor, hasMore, isFetchingMore } = state;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef(null);

  // FIX 1 — derive isDebouncing.
  const isDebouncing = query.trim() !== debouncedQuery;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // FIX 4 — resetKey keeps ref mutations inside effect scope only.
  const [resetKey, setResetKey] = useState(0);

  const nextCursorRef = useRef(null);
  const isFirstPageRef = useRef(true);

  // FIX 2 — single dispatch. FIX 4 — sole place refs mutated.
  useEffect(() => {
    dispatch({ type: 'RESET' });
    nextCursorRef.current = null;
    isFirstPageRef.current = true;
  }, [debouncedQuery, genre, resetKey]);

  // ─── URL ─────────────────────────────────────────────────────────────────

  const buildUrl = useCallback(
    (cursorValue) => {
      if (debouncedQuery && debouncedQuery.length >= 2) {
        return `/v1/watched/search?q=${encodeURIComponent(debouncedQuery)}${
          cursorValue ? `&cursor=${encodeURIComponent(cursorValue)}` : ''
        }`;
      }
      return `/v1/watched${genre ? `?genre=${encodeURIComponent(genre)}` : ''}${
        cursorValue ? `${genre ? '&' : '?'}cursor=${encodeURIComponent(cursorValue)}` : ''
      }`;
    },
    [debouncedQuery, genre]
  );

  const url = enabled ? buildUrl(cursor) : null;

  const { data, loading, error, mutate } = useGet(url, { noCache: !!cursor });

  // FIX 3 — [data] only dep.
  useEffect(() => {
    if (!data) return;

    const apiMovies = data.movies || [];
    const nextCursor = data.next_cursor ?? null;
    const isFirstPage = isFirstPageRef.current;

    queueMicrotask(() => {
      dispatch({ type: 'DATA_RECEIVED', payload: { apiMovies, nextCursor, isFirstPage } });
      nextCursorRef.current = nextCursor;
      isFirstPageRef.current = false;
    });
  }, [data]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    const next = nextCursorRef.current;
    if (!next) return;
    dispatch({ type: 'FETCH_MORE', payload: next });
  }, [hasMore, isFetchingMore]);

  // FIX 4 — no ref mutation here; resetKey triggers effect instead.
  const refresh = useCallback(() => {
    setResetKey((k) => k + 1);
    mutate();
  }, [mutate]);

  const silentRefresh = useCallback(() => {
    return globalMutate(buildUrl(null), undefined, { revalidate: true, populateCache: false });
  }, [buildUrl]);

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
