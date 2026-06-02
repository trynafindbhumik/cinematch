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
  const [error, setError] = useState(null);

  const [generateUrl, setGenerateUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const isFetchingRef = useRef(false);
  const generateRef = useRef(null);

  const currentSuggestion = suggestions[currentIndex] || null;
  const nextSuggestion = suggestions[currentIndex + 1] || null;
  const hasMore = suggestions.length > currentIndex + 1;

  const { data: generateData, loading: generateLoading } = useGetJson(generateUrl, {
    timeout: 300000,
  });
  const { data: nextSuggestionData, loading: nextLoading } = useGetJson(nextUrl);

  const generate = useCallback(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsGenerating(true);
    setError(null);
    setGenerateUrl('/v1/suggestions/generate');
  }, []);

  const nextMovie = useCallback((tmdbId) => {
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
      }
      isFetchingRef.current = false;
      setIsGenerating(false);
      setGenerateUrl(null);
    });
  }, [generateData, generate]);

  useEffect(() => {
    if (!nextSuggestionData) return;
    queueMicrotask(() => {
      if (nextSuggestionData.regeneration) {
        generate();
        return;
      }
      if (nextSuggestionData.suggestion) {
        setSuggestions((prev) => [...prev, nextSuggestionData.suggestion]);
      }
      setNextUrl(null);
    });
  }, [nextSuggestionData, generate]);

  useEffect(() => {
    queueMicrotask(() => {
      if (
        suggestions.length <= currentIndex + PRE_FETCH_THRESHOLD &&
        !isFetchingRef.current &&
        currentSuggestion &&
        nextSuggestion === null
      ) {
        nextMovie(currentSuggestion.tmdb_id);
      }
    });
  }, [suggestions.length, currentIndex, currentSuggestion, nextSuggestion, nextMovie]);

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
    hasMore,
    isGenerating: isGenerating || generateLoading || nextLoading,
    error,
    generate,
    nextMovie,
  };
}
