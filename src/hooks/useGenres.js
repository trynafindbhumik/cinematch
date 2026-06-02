'use client';

import { useCallback, useState } from 'react';

import { useFetch } from '@/lib/api';
import api from '@/lib/api/axios';

export function useGenres() {
  return useFetch('/v1/genres');
}

export function useUserGenres() {
  const { data, error, loading, refetch } = useFetch('/v1/genres/mine');
  return { data, error, loading, revalidate: refetch };
}

export function useAddGenre() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
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

export function useRemoveGenre() {
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
