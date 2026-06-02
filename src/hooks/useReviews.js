'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

import api from '@/lib/api/axios';

export function formatDateForApi(date) {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function useQueryParams(dateFrom, dateTo, cursor) {
  return useMemo(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('from', formatDateForApi(dateFrom));
    if (dateTo) params.append('to', formatDateForApi(dateTo));
    if (cursor) params.append('cursor', cursor);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [dateFrom, dateTo, cursor]);
}

function useReviewsData(dateFrom, dateTo, cursor) {
  const queryParams = useQueryParams(dateFrom, dateTo, cursor);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    api
      .get(`/v1/reviews${queryParams}`, { signal: controller.signal })
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
  }, [queryParams, tick]);

  return { data, error, loading, refetch: () => setTick((t) => t + 1) };
}

export function useReviews({ dateFrom, dateTo, cursor }) {
  const { data, error, loading, refetch } = useReviewsData(dateFrom, dateTo, cursor);
  const reviews = useMemo(() => data?.reviews ?? [], [data]);
  const nextCursor = data?.next_cursor ?? null;
  const hasMore = data?.has_more ?? false;
  return { reviews, nextCursor, hasMore, loading, error, refetch };
}

export function useReviewsOverview(dateFrom = null, dateTo = null) {
  const defaultFrom = useMemo(() => {
    if (dateFrom) return dateFrom;
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, [dateFrom]);

  const defaultTo = useMemo(() => {
    if (dateTo) return dateTo;
    return new Date();
  }, [dateTo]);

  const [reviews, setReviews] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const cursorInFlightRef = useRef(null);
  const nextCursorRef = useRef(null);
  const loadMoreRef = useRef(null);
  const observerFiredRef = useRef(false);

  const { data, loading: isFetching, refetch } = useReviewsData(defaultFrom, defaultTo, cursor);
  const hasMore = useMemo(() => data?.next_cursor !== null, [data]);

  useEffect(() => {
    if (!data) return;
    const apiReviews = data.reviews || [];
    const next = data.next_cursor ?? null;
    const cursorWeAreWaitingFor = cursorInFlightRef.current;
    nextCursorRef.current = next;
    if (cursorWeAreWaitingFor !== null && cursorWeAreWaitingFor !== cursor) return;
    cursorInFlightRef.current = null;
    queueMicrotask(() => {
      setIsLoading(false);
      if (next !== null) observerFiredRef.current = false;
      if (cursor === null) {
        setReviews(apiReviews);
      } else {
        setReviews((prev) => {
          const ids = new Set(prev.map((r) => r.id));
          return [...prev, ...apiReviews.filter((r) => !ids.has(r.id))];
        });
      }
    });
  }, [data, cursor]);

  useEffect(() => {
    const from = defaultFrom?.getTime();
    const to = defaultTo?.getTime();
    if (loadMoreRef.current?._lastFrom !== from || loadMoreRef.current?._lastTo !== to) {
      if (loadMoreRef.current) {
        loadMoreRef.current._lastFrom = from;
        loadMoreRef.current._lastTo = to;
      }
      setReviews([]);
      setCursor(null);
      setIsLoading(false);
      cursorInFlightRef.current = null;
      nextCursorRef.current = null;
      observerFiredRef.current = false;
    }
  }, [defaultFrom, defaultTo]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
          observerFiredRef.current = true;
          const cursorToFetch = nextCursorRef.current;
          cursorInFlightRef.current = cursorToFetch;
          nextCursorRef.current = null;
          setIsLoading(true);
          setCursor(cursorToFetch);
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, reviews.length]);

  const silentRefetch = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    reviews,
    hasMore,
    loading: isLoading || isFetching,
    loadMoreRef,
    refetch,
    silentRefetch,
  };
}

export function useInfiniteReviews({ dateFrom = null, dateTo = null } = {}) {
  const [reviews, setReviews] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextCursorRef = useRef(null);
  const cursorInFlightRef = useRef(null);
  const loadMoreRef = useRef(null);
  const lastFromToRef = useRef({ from: dateFrom?.getTime(), to: dateTo?.getTime() });

  const { data, loading: isFetching, refetch } = useReviewsData(dateFrom, dateTo, cursor);
  const hasMore = useMemo(() => data?.next_cursor !== null, [data]);

  useEffect(() => {
    if (!data) return;
    const apiReviews = data.reviews || [];
    const next = data.next_cursor ?? null;
    const cursorWeAreWaitingFor = cursorInFlightRef.current;
    nextCursorRef.current = next;
    if (cursorWeAreWaitingFor !== null && cursorWeAreWaitingFor !== cursor) return;
    cursorInFlightRef.current = null;
    queueMicrotask(() => {
      setIsLoading(false);
      if (next !== null) loadMoreRef.current && (loadMoreRef.current._observerFired = false);
      if (cursor === null) {
        setReviews(apiReviews);
      } else {
        setReviews((prev) => {
          const ids = new Set(prev.map((r) => r.id));
          return [...prev, ...apiReviews.filter((r) => !ids.has(r.id))];
        });
      }
    });
  }, [data, cursor]);

  useEffect(() => {
    const from = dateFrom?.getTime();
    const to = dateTo?.getTime();
    if (lastFromToRef.current.from !== from || lastFromToRef.current.to !== to) {
      lastFromToRef.current = { from, to };
      setReviews([]);
      setCursor(null);
      setIsLoading(false);
      cursorInFlightRef.current = null;
      nextCursorRef.current = null;
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
          const cursorToFetch = nextCursorRef.current;
          cursorInFlightRef.current = cursorToFetch;
          nextCursorRef.current = null;
          setIsLoading(true);
          setCursor(cursorToFetch);
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, reviews.length]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || !nextCursorRef.current) return;
    if (cursorInFlightRef.current !== null) return;
    const next = nextCursorRef.current;
    cursorInFlightRef.current = next;
    setIsLoading(true);
    setCursor(next);
  }, [hasMore, isLoading]);

  const silentRefetch = useCallback(() => refetch(), [refetch]);

  return {
    reviews,
    hasMore,
    loading: isLoading || isFetching,
    loadMoreRef,
    loadMore,
    refetch,
    silentRefetch,
  };
}

export function useUpdateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateReview = useCallback(async (reviewId, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/v1/reviews/${reviewId}`, reviewData);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { updateReview, loading, error };
}

export function useDeleteReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteReview = useCallback(async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/v1/reviews/${reviewId}`);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { deleteReview, loading, error };
}

export function transformReview(apiReview) {
  if (!apiReview) return null;
  return {
    id: apiReview.id,
    movieId: apiReview.tmdb_id,
    movieTitle: apiReview.title,
    moviePoster: apiReview.poster_url,
    rating: apiReview.rating,
    comment: apiReview.comment || apiReview.content,
    date: formatDateForDisplay(apiReview.created_at),
    createdAt: apiReview.created_at,
    source: apiReview.source,
  };
}

export function transformReviews(apiReviews) {
  return (apiReviews || []).map(transformReview).filter(Boolean);
}
