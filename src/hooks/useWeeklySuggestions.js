'use client';

import { useState, useEffect, useCallback } from 'react';

import api from '@/lib/api/axios';

export function useWeeklySuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [weekStart, setWeekStart] = useState('');
  const [remainingTries, setRemainingTries] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeeklySuggestions = useCallback(async () => {
    try {
      const res = await api.get('/v1/weekly-suggestions');
      const data = res.data?.data || res.data;
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setWeekStart(data.week_start || '');
        if (typeof data.remaining_tries === 'number') {
          setRemainingTries(data.remaining_tries);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch weekly suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/v1/suggestion-tries/generate');
      const data = res.data?.data || res.data;
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setRemainingTries(data.remaining_tries ?? 0);
        setWeekStart(data.week_start || '');
      }
      return data;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Failed to generate new suggestions';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    api
      .get('/v1/weekly-suggestions')
      .then((res) => {
        if (ignore) return;
        const data = res.data?.data || res.data;
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
          setWeekStart(data.week_start || '');
          if (typeof data.remaining_tries === 'number') {
            setRemainingTries(data.remaining_tries);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err?.message || 'Failed to fetch weekly suggestions');
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return {
    suggestions,
    weekStart,
    remainingTries,
    loading,
    error,
    fetchWeeklySuggestions,
    generateTry,
  };
}
