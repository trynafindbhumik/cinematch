'use client';

import { useState, useCallback } from 'react';

import api from '@/lib/api/axios';

export function useResendResetPassword() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resendReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/auth/resend-reset', { email }, { withAuth: false });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [{ data, loading, error }, resendReset];
}
