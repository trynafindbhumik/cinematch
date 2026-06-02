'use client';

import { useCallback, useState } from 'react';

import api from '@/lib/api/axios';

export function useReaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitReaction = useCallback(async (tmdbId, reactionId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        '/v1/reactions',
        { tmdb_id: tmdbId, reaction: reactionId },
        { timeout: 15000 }
      );
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const clearReaction = useCallback(async (tmdbId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/v1/reactions/${tmdbId}`, { timeout: 15000 });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { submitReaction, clearReaction, loading, error };
}
