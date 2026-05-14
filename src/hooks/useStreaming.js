'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

import { useGet, usePut, useDelete } from '@/lib/api';

const SERVICES_LIMIT = 20;

/**
 * Hook for fetching all streaming services
 * GET /v1/streaming-services
 */
export function useStreamingServices() {
  return useGet('/v1/streaming-services', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

/**
 * Hook for fetching user's selected streaming services
 * GET /v1/streaming-services/mine
 */
export function useUserStreamingServices() {
  return useGet('/v1/streaming-services/mine', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

/**
 * Hook for updating user's streaming services (bulk replace)
 * PUT /v1/streaming-services
 * Returns [data, loading, error, trigger]
 */
export function useUpdateStreamingServices(options = {}) {
  return usePut({
    disableRetries: true,
    disableAbort: true,
    ...options,
  });
}

/**
 * Hook for removing a single streaming service from user's profile
 * DELETE /v1/streaming-services/{serviceId}
 * Returns [data, loading, error, trigger]
 */
export function useRemoveStreamingService(options = {}) {
  return useDelete({
    disableRetries: true,
    disableAbort: true,
    ...options,
  });
}

/**
 * Hook for fetching streaming services with cursor-based pagination
 */
export function useStreamingServicesPaginated(options = {}) {
  const { enabled = true } = options;

  const [services, setServices] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  const [targetCursor, setTargetCursor] = useState(null);

  const fetchUrl = useMemo(() => {
    if (!enabled) {
      return null;
    }

    const params = new URLSearchParams({
      limit: String(SERVICES_LIMIT),
    });

    if (targetCursor !== null) {
      params.append('cursor', String(targetCursor));
    }

    return `/v1/streaming-services?${params.toString()}`;
  }, [enabled, targetCursor]);

  const { data, error, loading } = useGet(fetchUrl, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }

    if (!data && !error) {
      return;
    }

    if (error) {
      isLoadingRef.current = false;

      queueMicrotask(() => {
        setIsFetchingMore(false);
      });

      return;
    }

    const items = data?.streamingServices || [];
    const newCursor = data?.next_cursor || null;

    queueMicrotask(() => {
      setNextCursor(newCursor);
      setHasMore(Boolean(newCursor));
    });

    queueMicrotask(() => {
      setServices((prev) => {
        if (targetCursor === null) {
          return items;
        }

        const existingIds = new Set(prev.map((s) => s.id));

        const uniqueItems = items.filter((s) => !existingIds.has(s.id));

        return [...prev, ...uniqueItems];
      });
    });
    isLoadingRef.current = false;

    queueMicrotask(() => {
      setIsFetchingMore(false);
    });
  }, [data, error, targetCursor]);

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || !nextCursor) {
      return;
    }

    isLoadingRef.current = true;
    setIsFetchingMore(true);
    setTargetCursor(nextCursor);
  }, [hasMore, nextCursor]);

  const refresh = useCallback(() => {
    setServices([]);
    setHasMore(true);
    setNextCursor(null);
    setIsFetchingMore(false);

    isLoadingRef.current = false;

    setTargetCursor(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    services,
    nextCursor,
    hasMore,
    loading,
    error: error ?? null,
    fetchNextPage,
    refresh,
    isFetchingMore,
  };
}

/**
 * Hook for searching streaming services with cursor-based pagination
 */
export function useStreamingServicesSearch(initialQuery = '', options = {}) {
  const { enabled = true } = options;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const debounceTimerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);
  const activeQueryRef = useRef('');

  const [targetCursor, setTargetCursor] = useState(null);

  const fetchUrl = useMemo(() => {
    if (!enabled || !debouncedQuery) {
      return null;
    }

    const params = new URLSearchParams({
      limit: String(SERVICES_LIMIT),
      q: debouncedQuery,
    });

    if (targetCursor !== null) {
      params.append('cursor', String(targetCursor));
    }

    return `/v1/streaming-services/search?${params.toString()}`;
  }, [enabled, debouncedQuery, targetCursor]);

  const { data, error, loading } = useGet(fetchUrl, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }

    if (!data && !error) {
      return;
    }

    if (error) {
      isLoadingRef.current = false;

      queueMicrotask(() => {
        setIsFetchingMore(false);
      });

      return;
    }

    const items = data?.streamingServices || [];
    const newCursor = data?.next_cursor || null;

    queueMicrotask(() => {
      setNextCursor(newCursor);
      setHasMore(Boolean(newCursor));
    });

    queueMicrotask(() => {
      setResults((prev) => {
        if (targetCursor === null) {
          return items;
        }

        const existingIds = new Set(prev.map((s) => s.id));

        const uniqueItems = items.filter((s) => !existingIds.has(s.id));

        return [...prev, ...uniqueItems];
      });
    });

    isLoadingRef.current = false;

    queueMicrotask(() => {
      setIsFetchingMore(false);
    });
  }, [data, error, targetCursor]);

  const handleSearch = useCallback(
    (newQuery) => {
      setQuery(newQuery);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!newQuery.trim()) {
        setDebouncedQuery('');
        setResults([]);
        setHasMore(true);
        setNextCursor(null);
        setIsDebouncing(false);
        setIsFetchingMore(false);

        activeQueryRef.current = '';
        isLoadingRef.current = false;

        setTargetCursor(null);

        return;
      }

      setIsDebouncing(true);

      debounceTimerRef.current = setTimeout(() => {
        const trimmedQuery = newQuery.trim();

        setIsDebouncing(false);

        if (trimmedQuery !== debouncedQuery) {
          setDebouncedQuery(trimmedQuery);

          setResults([]);
          setHasMore(true);
          setNextCursor(null);
          setIsFetchingMore(false);

          isLoadingRef.current = false;

          activeQueryRef.current = trimmedQuery;

          setTargetCursor(null);
        }
      }, 300);
    },
    [debouncedQuery]
  );

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || !activeQueryRef.current || !nextCursor) {
      return;
    }

    isLoadingRef.current = true;

    setIsFetchingMore(true);

    setTargetCursor(nextCursor);
  }, [hasMore, nextCursor]);

  const refresh = useCallback(() => {
    setResults([]);
    setHasMore(true);
    setNextCursor(null);
    setIsFetchingMore(false);

    isLoadingRef.current = false;

    setTargetCursor(null);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setQuery('');
    setDebouncedQuery('');
    setResults([]);

    setHasMore(true);
    setNextCursor(null);

    setIsDebouncing(false);
    setIsFetchingMore(false);

    activeQueryRef.current = '';
    isLoadingRef.current = false;

    setTargetCursor(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const isActive = Boolean(debouncedQuery);

  return {
    results,
    nextCursor,
    hasMore,
    loading,
    error: error ?? null,
    fetchNextPage,
    refresh,
    setQuery: handleSearch,
    clearSearch,
    isActive,
    query,
    isDebouncing,
    isFetchingMore,
  };
}
