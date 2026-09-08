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
 * Hook for searching movies by query.
 */
export function useSearchMovies(query) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    api
      .get(`/v1/movies/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
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
  }, [query]);

  return { data, error, loading };
}

/**
 * Hook for fetching movie details by TMDB ID.
 */
export function useMovieDetails(tmdbId) {
  const url = tmdbId ? `/v1/movies/${tmdbId}` : null;
  const { data, error, loading, refetch } = useMoviesUrl(url);

  return {
    movieData: data?.data || data || null,
    loading,
    error,
    refetch,
  };
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
    setMovies([]);
    setPage(1);
    pageRef.current = 1;
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
 * Hook for fetching movie reviews from API.
 */
export function useMovieReviews(tmdbId) {
  const url = tmdbId ? `/v1/movies/${tmdbId}/reviews` : null;
  const { data, error, loading, refetch } = useMoviesUrl(url);

  return {
    reviews: data?.reviews || data?.data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Helper to submit a new movie review to API.
 */
export async function createMovieReview(tmdbId, rating, reviewText) {
  const res = await api.post('/v1/reviews', {
    tmdb_id: Number(tmdbId),
    rating: Number(rating),
    review_text: reviewText,
  });
  return res.data;
}

/**
 * Hook for fetching user collection movie IDs ('favorites' | 'watchlist' | 'watched')
 */
export function useCollectionIds(collectionType, enabled = true) {
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collectionType || !enabled) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => setLoading(true));

    api
      .get(`/v1/${collectionType}/ids`, { signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        const fetched =
          res.data?.tmdb_ids || res.data?.ids || (Array.isArray(res.data) ? res.data : []);
        setIds(fetched);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [collectionType, enabled]);

  return { ids, loading };
}
