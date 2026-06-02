'use client';

import { useState, useCallback } from 'react';

import api from '@/lib/api/axios';
import { VerifySchema, validateSchema } from '@/lib/validations/auth';

export function useVerifyToken() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyToken = useCallback(async ({ token }) => {
    const validation = validateSchema(VerifySchema, { token });
    if (!validation.success) {
      const err = { status: 400, data: null, message: validation.errorMessage };
      setError(err);
      setLoading(false);
      throw err;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/auth/verify', validation.data, { withAuth: false });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [{ data, loading, error }, verifyToken];
}
