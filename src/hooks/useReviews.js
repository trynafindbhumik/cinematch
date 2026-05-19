'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { mutate as globalMutate } from 'swr';

import { useGet } from '@/lib/api';
import { useDelete, usePatch } from '@/lib/api/hooks';

/**
 * Format date to DD-MM-YYYY for API
 */
export function formatDateForApi(date) {
  if (!date) return null;

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Hook to fetch user reviews with cursor pagination
 */
export function useReviews({ dateFrom, dateTo, cursor }) {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (dateFrom) {
      params.append('from', formatDateForApi(dateFrom));
    }

    if (dateTo) {
      params.append('to', formatDateForApi(dateTo));
    }

    if (cursor) {
      params.append('cursor', cursor);
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
  }, [dateFrom, dateTo, cursor]);

  const url = `/v1/reviews${queryParams}`;

  const { data, error, loading, mutate } = useGet(url, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    noCache: true,
  });

  const reviews = useMemo(() => {
    return data?.reviews ?? [];
  }, [data]);

  const nextCursor = data?.next_cursor ?? null;
  const hasMore = data?.has_more ?? false;

  return {
    reviews,
    nextCursor,
    hasMore,
    loading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook for infinite scroll reviews fetching with 7-day filter
 * Used in Overview to show last 7 days of reviews
 */
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
  const observerTimeoutRef = useRef(null);

  const filterResetRef = useRef({
    from: defaultFrom?.getTime(),
    to: defaultTo?.getTime(),
  });

  useEffect(() => {
    const timeoutRef = observerTimeoutRef.current;

    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append('from', formatDateForApi(defaultFrom));
    params.append('to', formatDateForApi(defaultTo));

    if (cursor) {
      params.append('cursor', cursor);
    }

    return `?${params.toString()}`;
  }, [defaultFrom, defaultTo, cursor]);

  const {
    data,
    loading: isFetching,
    mutate,
  } = useGet(`/v1/reviews${queryParams}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    noCache: true,
  });

  const hasMore = useMemo(() => {
    return data?.next_cursor !== null;
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const apiReviews = data.reviews || [];
    const next = data.next_cursor ?? null;

    const cursorWeAreWaitingFor = cursorInFlightRef.current;

    nextCursorRef.current = next;

    if (cursorWeAreWaitingFor !== null && cursorWeAreWaitingFor !== cursor) {
      return;
    }

    cursorInFlightRef.current = null;

    queueMicrotask(() => {
      setIsLoading(false);

      if (next !== null) {
        observerFiredRef.current = false;
      }

      if (cursor === null) {
        setReviews(apiReviews);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));

          const newReviews = apiReviews.filter((r) => !existingIds.has(r.id));

          return [...prev, ...newReviews];
        });
      }
    });
  }, [data, cursor]);

  const resetCounterRef = useRef(0);

  useEffect(() => {
    const currentFrom = defaultFrom?.getTime();
    const currentTo = defaultTo?.getTime();

    if (filterResetRef.current.from !== currentFrom || filterResetRef.current.to !== currentTo) {
      filterResetRef.current = {
        from: currentFrom,
        to: currentTo,
      };

      resetCounterRef.current += 1;

      const resetCount = resetCounterRef.current;

      queueMicrotask(() => {
        if (resetCounterRef.current === resetCount) {
          setReviews([]);
          setCursor(null);
          setIsLoading(false);

          cursorInFlightRef.current = null;
          nextCursorRef.current = null;
          observerFiredRef.current = false;
        }
      });
    }
  }, [defaultFrom, defaultTo]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;

    const observerCallback = (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
        observerFiredRef.current = true;

        const cursorToFetch = nextCursorRef.current;

        cursorInFlightRef.current = cursorToFetch;
        nextCursorRef.current = null;

        setIsLoading(true);
        setCursor(cursorToFetch);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0,
      rootMargin: '0px',
    });

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, reviews.length]);

  const refetch = useCallback(() => {
    setReviews([]);
    setCursor(null);
    setIsLoading(false);

    return mutate();
  }, [mutate]);

  /**
   * Silent refetch that revalidates data without showing loading states.
   * Uses populateCache: false to keep existing data visible while fetching.
   */
  const silentRefetch = useCallback(() => {
    return globalMutate(`/v1/reviews${queryParams}`, undefined, {
      revalidate: true,
      populateCache: false,
    });
  }, [queryParams]);

  return {
    reviews,
    hasMore,
    loading: isLoading || isFetching,
    loadMoreRef,
    refetch,
    silentRefetch,
  };
}

/**
 * Hook for reviews with full pagination (infinity scroll)
 * Used in Reviews tab
 */
export function useInfiniteReviews({ dateFrom = null, dateTo = null } = {}) {
  const [reviews, setReviews] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextCursorRef = useRef(null);
  const cursorInFlightRef = useRef(null);
  const observerFiredRef = useRef(false);
  const observerTimeoutRef = useRef(null);

  const loadMoreRef = useRef(null);

  const filterResetRef = useRef({
    from: dateFrom?.getTime(),
    to: dateTo?.getTime(),
  });

  const resetCounterRef = useRef(0);

  useEffect(() => {
    const timeoutRef = observerTimeoutRef.current;

    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (dateFrom) {
      params.append('from', formatDateForApi(dateFrom));
    }

    if (dateTo) {
      params.append('to', formatDateForApi(dateTo));
    }

    if (cursor) {
      params.append('cursor', cursor);
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
  }, [dateFrom, dateTo, cursor]);

  const {
    data,
    loading: isFetching,
    mutate,
  } = useGet(`/v1/reviews${queryParams}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    noCache: true,
  });

  const hasMore = useMemo(() => {
    return data?.next_cursor !== null;
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const apiReviews = data.reviews || [];
    const next = data.next_cursor ?? null;

    const cursorWeAreWaitingFor = cursorInFlightRef.current;

    nextCursorRef.current = next;

    if (cursorWeAreWaitingFor !== null && cursorWeAreWaitingFor !== cursor) {
      return;
    }

    cursorInFlightRef.current = null;

    queueMicrotask(() => {
      setIsLoading(false);

      if (next !== null) {
        observerFiredRef.current = false;
      }

      if (cursor === null) {
        setReviews(apiReviews);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));

          const newReviews = apiReviews.filter((r) => !existingIds.has(r.id));

          return [...prev, ...newReviews];
        });
      }
    });
  }, [data, cursor]);

  useEffect(() => {
    const currentFrom = dateFrom?.getTime();
    const currentTo = dateTo?.getTime();

    if (filterResetRef.current.from !== currentFrom || filterResetRef.current.to !== currentTo) {
      filterResetRef.current = {
        from: currentFrom,
        to: currentTo,
      };

      resetCounterRef.current += 1;

      const resetCount = resetCounterRef.current;

      queueMicrotask(() => {
        if (resetCounterRef.current === resetCount) {
          setReviews([]);
          setCursor(null);
          setIsLoading(false);

          cursorInFlightRef.current = null;
          nextCursorRef.current = null;
          observerFiredRef.current = false;
        }
      });
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;

    const observerCallback = (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
        observerFiredRef.current = true;

        const cursorToFetch = nextCursorRef.current;

        cursorInFlightRef.current = cursorToFetch;
        nextCursorRef.current = null;

        setIsLoading(true);
        setCursor(cursorToFetch);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0,
      rootMargin: '0px',
    });

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, reviews.length]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || !nextCursorRef.current) {
      return;
    }

    if (cursorInFlightRef.current !== null) {
      return;
    }

    const nextCursor = nextCursorRef.current;

    cursorInFlightRef.current = nextCursor;

    setIsLoading(true);
    setCursor(nextCursor);
  }, [hasMore, isLoading]);

  const refetch = useCallback(() => {
    setReviews([]);
    setCursor(null);
    setIsLoading(false);

    return mutate();
  }, [mutate]);

  /**
   * Silent refetch that revalidates data without showing loading states.
   * Uses populateCache: false to keep existing data visible while fetching.
   */
  const silentRefetch = useCallback(() => {
    return globalMutate(`/v1/reviews${queryParams}`, undefined, {
      revalidate: true,
      populateCache: false,
    });
  }, [queryParams]);

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

/**
 * Hook for updating a review
 */
export function useUpdateReview() {
  const [, loading, error, trigger] = usePatch();

  const updateReview = useCallback(
    async (reviewId, reviewData) => {
      const result = await trigger(`/v1/reviews/${reviewId}`, reviewData);

      return result;
    },
    [trigger]
  );

  return { updateReview, loading, error };
}

/**
 * Hook for deleting a review
 */
export function useDeleteReview() {
  const [, loading, error, trigger] = useDelete();

  const deleteReview = useCallback(
    async (reviewId) => {
      const result = await trigger(`/v1/reviews/${reviewId}`, null, { allowEmptyBody: true });

      return result;
    },
    [trigger]
  );

  return { deleteReview, loading, error };
}

/**
 * Transform API review to component format
 */
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

/**
 * Transform API reviews array
 */
export function transformReviews(apiReviews) {
  return (apiReviews || []).map(transformReview).filter(Boolean);
}
