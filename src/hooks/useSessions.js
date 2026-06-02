'use client';

import { useCallback, useState } from 'react';

import { useFetch } from '@/lib/api';
import api from '@/lib/api/axios';

const SESSIONS_URL = '/v1/auth/sessions';

export function useSessions(enabled = true) {
  const { data, error, loading, refetch } = useFetch(enabled ? SESSIONS_URL : null, {
    skip: !enabled,
  });
  return { data, error, loading, mutate: refetch, revalidate: refetch, silentRefetch: refetch };
}

export function useDeleteSession() {
  const [, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteSession = useCallback(async (sessionId, magicLink = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = magicLink ? `?magic_link=${encodeURIComponent(magicLink)}` : '';
      const res = await api.delete(`/v1/auth/sessions${params}`, {
        data: { session_id: sessionId },
      });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, deleteSession };
}

export function useFetchSessionsWithMagicLink(magicLink) {
  const url = magicLink ? `/v1/auth/sessions?magic_link=${encodeURIComponent(magicLink)}` : null;
  return useFetch(url, { withAuth: false, skip: !magicLink });
}
