'use client';

import { useState, useCallback } from 'react';

import { saveAuthTokens, saveAuthFlags } from '@/lib/api/auth';
import api from '@/lib/api/axios';

export function useLogin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/auth/login', formData, { withAuth: false });
      setData(res.data);
      setLoading(false);
      if (res.data?.access_token) {
        saveAuthTokens({ accessToken: res.data.access_token });
        saveAuthFlags({
          isVerified: res.data.is_verified,
          needsOnboarding: res.data.needs_onboarding,
        });
      }
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [{ data, loading, error }, login];
}
