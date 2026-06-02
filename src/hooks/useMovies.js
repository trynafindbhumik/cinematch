'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import api from '@/lib/api/axios';

function useMoviesUrl(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return undefined;
    const controller = new AbortController();
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

  return { data, error, loading, refetch: () => setTick((t) => t + 1) };
}

/**
 * Hook for fetching trending movies with pagination and infinite scroll support.
 */
export function useTrendingMovies(options = {}) {
  const { enabled = true } = options;

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const observerFiredRef = useRef(false);

  const url = enabled ? `/v1/movies/trending?page=${page}` : null;
  const { data, error, loading, refetch } = useMoviesUrl(url);

  useEffect(() => {
    if (!data) return;
    const apiMovies = data.movies || [];
    const apiTotalPages = data.total_pages ?? 1;
    const currentPage = data.page ?? 1;
    const nextHasMore = currentPage < apiTotalPages;
    queueMicrotask(() => {
      setTotalPages(apiTotalPages);
      setHasMore(nextHasMore);
      setMovies((prev) => {
        if (page === 1) return apiMovies;
        const ids = new Set(prev.map((m) => m.tmdb_id || m.id));
        return [...prev, ...apiMovies.filter((m) => !ids.has(m.tmdb_id || m.id))];
      });
      setIsFetchingMore(false);
    });
    isLoadingRef.current = false;
    observerFiredRef.current = false;
  }, [data, page]);

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || observerFiredRef.current) return;
    observerFiredRef.current = true;
    const nextPage = pageRef.current + 1;
    if (nextPage > totalPages) {
      queueMicrotask(() => setHasMore(false));
      return;
    }
    pageRef.current = nextPage;
    setPage(nextPage);
  }, [hasMore, totalPages]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    isLoadingRef.current = false;
    observerFiredRef.current = false;
    setPage(1);
    setMovies([]);
    setTotalPages(1);
    setHasMore(true);
    setIsFetchingMore(false);
    refetch();
  }, [refetch]);

  return {
    movies,
    page,
    totalPages,
    hasMore,
    loading,
    error,
    fetchNextPage,
    refresh,
    isFetchingMore,
  };
}

/**
 * Hook for searching movies with pagination and debouncing.
 */
export function useSearchMovies(initialQuery = '', options = {}) {
  const { enabled = true } = options;
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const debounceTimerRef = useRef(null);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const observerFiredRef = useRef(false);

  const url =
    enabled && debouncedQuery.length >= 2
      ? `/v1/movies/search?q=${encodeURIComponent(debouncedQuery)}&page=${page}`
      : null;
  const { data, error, loading, refetch } = useMoviesUrl(url);

  useEffect(() => {
    if (!data) return;
    const apiMovies = data.movies || [];
    const apiTotalPages = data.total_pages ?? 1;
    const currentPage = data.page ?? 1;
    const nextHasMore = currentPage < apiTotalPages;
    queueMicrotask(() => {
      setTotalPages(apiTotalPages);
      setHasMore(nextHasMore);
      setMovies((prev) => {
        if (currentPage === 1) return apiMovies;
        const ids = new Set(prev.map((m) => m.tmdb_id || m.id));
        return [...prev, ...apiMovies.filter((m) => !ids.has(m.tmdb_id || m.id))];
      });
      setIsFetchingMore(false);
    });
    isLoadingRef.current = false;
    observerFiredRef.current = false;
  }, [data]);

  useEffect(() => {
    if (loading && page > 1) {
      queueMicrotask(() => setIsFetchingMore(true));
      isLoadingRef.current = true;
    }
  }, [loading, page]);

  const handleSearch = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (newQuery.trim().length < 2) {
        setDebouncedQuery('');
        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setHasMore(true);
        setIsDebouncing(false);
        pageRef.current = 1;
        return;
      }
      setIsDebouncing(true);
      debounceTimerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        if (newQuery.trim() !== debouncedQuery) {
          pageRef.current = 1;
          setPage(1);
          setMovies([]);
          setTotalPages(1);
          setHasMore(true);
          setDebouncedQuery(newQuery.trim());
        }
      }, 400);
    },
    [debouncedQuery]
  );

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || !debouncedQuery || observerFiredRef.current) return;
    observerFiredRef.current = true;
    const nextPage = pageRef.current + 1;
    if (nextPage > totalPages) {
      queueMicrotask(() => setHasMore(false));
      return;
    }
    pageRef.current = nextPage;
    setPage(nextPage);
  }, [debouncedQuery, hasMore, totalPages]);

  const refresh = useCallback(() => {
    setMovies([]);
    setPage(1);
    pageRef.current = 1;
    refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setQuery('');
    setDebouncedQuery('');
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    setHasMore(true);
    setIsFetchingMore(false);
    setIsDebouncing(false);
    pageRef.current = 1;
    isLoadingRef.current = false;
    observerFiredRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    movies,
    page,
    totalPages,
    hasMore,
    loading,
    error,
    fetchNextPage,
    refresh,
    setQuery: handleSearch,
    clearSearch,
    isActive: debouncedQuery.length >= 2,
    query,
    isFetchingMore,
    isDebouncing,
  };
}
