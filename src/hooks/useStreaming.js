'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import api from '@/lib/api/axios';

const SERVICES_LIMIT = 20;

function useFetchUrl(url) {
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

export function useStreamingServices() {
  return useFetchUrl('/v1/streaming-services');
}

export function useUserStreamingServices() {
  const { data, error, loading, refetch } = useFetchUrl('/v1/streaming-services/mine');
  return { data, error, loading, silentRefetch: refetch };
}

export function useUpdateStreamingServices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(url, payload);
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

export function useRemoveStreamingService() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(url);
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

export function useStreamingServicesPaginated(options = {}) {
  const { enabled = true } = options;
  const [services, setServices] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [targetCursor, setTargetCursor] = useState(null);

  const isLoadingRef = useRef(false);

  const fetchUrl = useMemo(() => {
    if (!enabled) return null;
    const params = new URLSearchParams({ limit: String(SERVICES_LIMIT) });
    if (targetCursor !== null) params.append('cursor', String(targetCursor));
    return `/v1/streaming-services?${params.toString()}`;
  }, [enabled, targetCursor]);

  const { data, error, loading } = useFetchUrl(fetchUrl);

  useEffect(() => {
    if (!data && !error) return;
    if (error) {
      isLoadingRef.current = false;
      queueMicrotask(() => setIsFetchingMore(false));
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
        if (targetCursor === null) return items;
        const ids = new Set(prev.map((s) => s.id));
        return [...prev, ...items.filter((s) => !ids.has(s.id))];
      });
    });
    isLoadingRef.current = false;
    queueMicrotask(() => setIsFetchingMore(false));
  }, [data, error, targetCursor]);

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || !nextCursor) return;
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

  return {
    services,
    nextCursor,
    hasMore,
    loading,
    error,
    fetchNextPage,
    refresh,
    isFetchingMore,
  };
}

export function useStreamingServicesSearch(initialQuery = '', options = {}) {
  const { enabled = true } = options;
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [targetCursor, setTargetCursor] = useState(null);

  const debounceTimerRef = useRef(null);
  const isLoadingRef = useRef(false);

  const fetchUrl = useMemo(() => {
    if (!enabled || !debouncedQuery) return null;
    const params = new URLSearchParams({ limit: String(SERVICES_LIMIT), q: debouncedQuery });
    if (targetCursor !== null) params.append('cursor', String(targetCursor));
    return `/v1/streaming-services/search?${params.toString()}`;
  }, [enabled, debouncedQuery, targetCursor]);

  const { data, error, loading } = useFetchUrl(fetchUrl);

  useEffect(() => {
    if (!data && !error) return;
    if (error) {
      isLoadingRef.current = false;
      queueMicrotask(() => setIsFetchingMore(false));
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
        if (targetCursor === null) return items;
        const ids = new Set(prev.map((s) => s.id));
        return [...prev, ...items.filter((s) => !ids.has(s.id))];
      });
    });
    isLoadingRef.current = false;
    queueMicrotask(() => setIsFetchingMore(false));
  }, [data, error, targetCursor]);

  const handleSearch = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (!newQuery.trim()) {
        setDebouncedQuery('');
        setResults([]);
        setHasMore(true);
        setNextCursor(null);
        setIsDebouncing(false);
        setIsFetchingMore(false);
        isLoadingRef.current = false;
        setTargetCursor(null);
        return;
      }
      setIsDebouncing(true);
      debounceTimerRef.current = setTimeout(() => {
        const trimmed = newQuery.trim();
        setIsDebouncing(false);
        if (trimmed !== debouncedQuery) {
          setDebouncedQuery(trimmed);
          setResults([]);
          setHasMore(true);
          setNextCursor(null);
          setIsFetchingMore(false);
          isLoadingRef.current = false;
          setTargetCursor(null);
        }
      }, 300);
    },
    [debouncedQuery]
  );

  const fetchNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore || !nextCursor) return;
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
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setHasMore(true);
    setNextCursor(null);
    setIsDebouncing(false);
    setIsFetchingMore(false);
    isLoadingRef.current = false;
    setTargetCursor(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    results,
    nextCursor,
    hasMore,
    loading,
    error,
    fetchNextPage,
    refresh,
    setQuery: handleSearch,
    clearSearch,
    isActive: Boolean(debouncedQuery),
    query,
    isDebouncing,
    isFetchingMore,
  };
}
