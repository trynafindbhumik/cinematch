'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { useGet } from '@/lib/api';

/**
 * Hook for fetching trending movies with pagination and infinite scroll support
 * GET /v1/movies/trending?page=1
 */
export function useTrendingMovies(options = {}) {
  const { enabled = true } = options;

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Prevent race conditions between scroll observer and data updates
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const observerFiredRef = useRef(false);

  const buildUrl = useCallback((pageNum) => {
    return `/v1/movies/trending?page=${pageNum}`;
  }, []);

  const { data, error, loading, mutate } = useGet(enabled ? buildUrl(page) : null, {
    ...options,
    noCache: page > 1,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const apiMovies = data.movies || [];
    const apiTotalPages = data.total_pages ?? 1;
    const currentPage = data.page ?? 1;
    const nextHasMore = currentPage < apiTotalPages;

    queueMicrotask(() => {
      setTotalPages(apiTotalPages);
      setHasMore(nextHasMore);

      setMovies((prev) => {
        if (page === 1) {
          return apiMovies;
        }

        const existingIds = new Set(prev.map((m) => m.tmdb_id || m.id));

        const newMovies = apiMovies.filter((m) => !existingIds.has(m.tmdb_id || m.id));

        return [...prev, ...newMovies];
      });

      setIsFetchingMore(false);
    });

    isLoadingRef.current = false;
    observerFiredRef.current = false;
  }, [data, page]);

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || observerFiredRef.current) {
      return;
    }

    observerFiredRef.current = true;

    const nextPage = pageRef.current + 1;

    if (nextPage > totalPages) {
      queueMicrotask(() => {
        setHasMore(false);
      });

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

    mutate();
  }, [mutate]);

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
 * Hook for searching movies with pagination and proper debouncing
 * GET /v1/movies/search?q=...&page=1
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

  // Refs for debounce, pagination, and scroll observer state
  const debounceTimerRef = useRef(null);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const observerFiredRef = useRef(false);

  const buildUrl = useCallback((searchQuery, pageNum) => {
    if (!searchQuery || searchQuery.length < 2) {
      return null;
    }

    return `/v1/movies/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
  }, []);

  const { data, error, loading, mutate } = useGet(
    enabled && debouncedQuery.length >= 2 ? buildUrl(debouncedQuery, page) : null,
    {
      ...options,
      noCache: page > 1,
    }
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const apiMovies = data.movies || [];
    const apiTotalPages = data.total_pages ?? 1;
    const currentPage = data.page ?? 1;
    const nextHasMore = currentPage < apiTotalPages;

    queueMicrotask(() => {
      setTotalPages(apiTotalPages);
      setHasMore(nextHasMore);

      setMovies((prev) => {
        if (currentPage === 1) {
          return apiMovies;
        }

        const existingIds = new Set(prev.map((m) => m.tmdb_id || m.id));

        const newMovies = apiMovies.filter((m) => !existingIds.has(m.tmdb_id || m.id));

        return [...prev, ...newMovies];
      });

      setIsFetchingMore(false);
    });

    isLoadingRef.current = false;
    observerFiredRef.current = false;
  }, [data]);

  // Loading state: show "fetching more" indicator when paginating
  useEffect(() => {
    if (loading && page > 1) {
      queueMicrotask(() => {
        setIsFetchingMore(true);
      });

      isLoadingRef.current = true;
    }
  }, [loading, page]);

  const handleSearch = useCallback(
    (newQuery) => {
      setQuery(newQuery);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

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
    if (isLoadingRef.current || !hasMore || !debouncedQuery || observerFiredRef.current) {
      return;
    }

    observerFiredRef.current = true;

    const nextPage = pageRef.current + 1;

    if (nextPage > totalPages) {
      queueMicrotask(() => {
        setHasMore(false);
      });

      return;
    }

    pageRef.current = nextPage;

    setPage(nextPage);
  }, [debouncedQuery, hasMore, totalPages]);

  const refresh = useCallback(() => {
    setMovies([]);
    setPage(1);

    pageRef.current = 1;

    mutate();
  }, [mutate]);

  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

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

  // Clear debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const isActive = debouncedQuery.length >= 2;

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
    isActive,
    query,
    isFetchingMore,
    isDebouncing,
  };
}
