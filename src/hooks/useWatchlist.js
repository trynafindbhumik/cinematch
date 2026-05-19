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

export default function useWatchlist({ query = '', genre = null, enabled = true } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, cursor, hasMore, isFetchingMore } = state;

  // debouncedQuery — setState only inside setTimeout (async), not synchronously in effect.
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef(null);

  // FIX 1 — derive isDebouncing: pure computation, no state, no effect setState.
  const isDebouncing = query.trim() !== debouncedQuery;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // FIX 4 — resetKey: incrementing triggers the reset effect so ref mutations
  // stay inside effects only — satisfies react-hooks/immutability.
  const [resetKey, setResetKey] = useState(0);

  const nextCursorRef = useRef(null);
  const isFirstPageRef = useRef(true);

  // FIX 2 — single dispatch. FIX 4 — only place refs are mutated (effect scope).
  useEffect(() => {
    dispatch({ type: 'RESET' });
    nextCursorRef.current = null;
    isFirstPageRef.current = true;
  }, [debouncedQuery, genre, resetKey]);

  // ─── URL ─────────────────────────────────────────────────────────────────

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

  // FIX 3 — data effect has only [data] dep. cursor/items replaced by refs + reducer.
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

  // FIX 4 — refresh never touches refs directly; resetKey increment triggers effect.
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
