'use client';

import { useState, useCallback } from 'react';

import { clearAuthTokens } from '@/lib/api/auth';
import api from '@/lib/api/axios';

export function useLogout() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/auth/logout', {});
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      clearAuthTokens();
    }
  }, []);

  return [{ data, loading, error }, logout];
}
