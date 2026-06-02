'use client';

import { useState, useCallback } from 'react';

import api from '@/lib/api/axios';

export function useInitVerify() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url = '/v1/auth/init-verify', payload) => {
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
