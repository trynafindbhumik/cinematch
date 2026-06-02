'use client';

import { useState, useCallback } from 'react';

import api from '@/lib/api/axios';

export function useSignup() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/auth/signup', formData, { withAuth: false });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [{ data, loading, error }, signup];
}
