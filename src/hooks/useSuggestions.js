'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import api from '@/lib/api/axios';

const PRE_FETCH_THRESHOLD = 2;

function useGetJson(url, { timeout } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    api
      .get(url, { signal: controller.signal, timeout })
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
  }, [url, timeout]);

  return { data, error, loading };
}

export default function useSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMoreBackend, setHasMoreBackend] = useState(true);
  const [error, setError] = useState(null);

  const [generateUrl, setGenerateUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const isFetchingRef = useRef(false);
  const lastFetchedIdRef = useRef(null);
  const generateRef = useRef(null);

  const currentSuggestion = suggestions[currentIndex] || null;
  const nextSuggestion = suggestions[currentIndex + 1] || null;
  const hasMore = suggestions.length > currentIndex + 1;

  const {
    data: generateData,
    loading: generateLoading,
    error: generateErr,
  } = useGetJson(generateUrl, {
    timeout: 300000,
  });
  const { data: nextSuggestionData, error: nextErr } = useGetJson(nextUrl);

  const generate = useCallback(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsGenerating(true);
    setError(null);
    setHasMoreBackend(true);
    lastFetchedIdRef.current = null;
    setGenerateUrl('/v1/suggestions/generate');
  }, []);

  const nextMovie = useCallback((tmdbId) => {
    if (!tmdbId || lastFetchedIdRef.current === tmdbId) return;
    lastFetchedIdRef.current = tmdbId;
    isFetchingRef.current = true;
    setNextUrl(`/v1/suggestions/next?tmdb_id=${tmdbId}`);
  }, []);

  useEffect(() => {
    if (!generateData) return;
    queueMicrotask(() => {
      if (generateData.regeneration) {
        generate();
        return;
      }
      if (generateData.suggestions && generateData.suggestions.length > 0) {
        setSuggestions(generateData.suggestions);
        setCurrentIndex(0);
        setHasMoreBackend(true);
      }
      isFetchingRef.current = false;
      setIsGenerating(false);
      setGenerateUrl(null);
    });
  }, [generateData, generate]);

  useEffect(() => {
    if (generateErr) {
      queueMicrotask(() => {
        isFetchingRef.current = false;
        setIsGenerating(false);
        setGenerateUrl(null);
        setError(generateErr.response?.data?.error || 'Failed to load suggestions');
      });
    }
  }, [generateErr]);

  useEffect(() => {
    if (!nextSuggestionData) return;
    queueMicrotask(() => {
      if (nextSuggestionData.regeneration) {
        generate();
        return;
      }
      if (nextSuggestionData.finished || !nextSuggestionData.has_more) {
        setHasMoreBackend(false);
      }
      if (nextSuggestionData.suggestion) {
        const newMovie = nextSuggestionData.suggestion;
        setSuggestions((prev) => {
          if (prev.some((item) => item.tmdb_id === newMovie.tmdb_id)) {
            return prev;
          }
          return [...prev, newMovie];
        });
      }
      isFetchingRef.current = false;
      setNextUrl(null);
    });
  }, [nextSuggestionData, generate]);

  useEffect(() => {
    if (nextErr) {
      queueMicrotask(() => {
        isFetchingRef.current = false;
        setNextUrl(null);
      });
    }
  }, [nextErr]);

  useEffect(() => {
    queueMicrotask(() => {
      const remaining = suggestions.length - currentIndex;
      if (
        suggestions.length > 0 &&
        remaining <= PRE_FETCH_THRESHOLD &&
        hasMoreBackend &&
        !isFetchingRef.current &&
        !nextUrl
      ) {
        const lastSuggestion = suggestions[suggestions.length - 1];
        if (lastSuggestion && lastSuggestion.tmdb_id) {
          nextMovie(lastSuggestion.tmdb_id);
        }
      }
    });
  }, [suggestions, currentIndex, hasMoreBackend, nextUrl, nextMovie]);

  useEffect(() => {
    generateRef.current = generate;
  }, [generate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateRef.current?.();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return {
    currentSuggestion,
    nextSuggestion,
    suggestions,
    currentIndex,
    setCurrentIndex,
    hasMore,
    isGenerating: isGenerating || generateLoading,
    error,
    generate,
    nextMovie,
  };
}
