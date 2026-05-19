'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useGet } from '@/lib/api';

const PRE_FETCH_THRESHOLD = 2;

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

  // GET /v1/suggestions/generate
  const { data: generateData, loading: generateLoading } = useGet(generateUrl, {
    withAuth: true,
    timeout: 300000,
  });

  // GET /v1/suggestions/next
  const { data: nextSuggestionData, loading: nextLoading } = useGet(nextUrl, {
    withAuth: true,
  });

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

  // Handle generate response
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

  // Handle next suggestion response
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

  // Pre-fetch when getting low on suggestions
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

  // Initial load - use ref to avoid direct setState in effect
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
