'use client';

import { useState, useCallback } from 'react';

import api from '@/lib/api/axios';

export function useResetPassword() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        '/v1/auth/reset-password',
        { token, new_password: newPassword },
        { withAuth: false }
      );
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [{ data, loading, error }, resetPassword];
}
