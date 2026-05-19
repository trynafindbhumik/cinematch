'use client';

import { useCallback } from 'react';
import { mutate as globalMutate } from 'swr';

import { useGet, useDelete } from '@/lib/api';

const SESSIONS_URL = '/v1/auth/sessions';

export function useSessions(enabled = true) {
  const { data, loading, error, mutate } = useGet(enabled ? SESSIONS_URL : null, {
    withAuth: true,
    noCache: true,
  });

  /**
   * Silent refetch that revalidates data without showing loading states.
   * Uses populateCache: false to keep existing data visible while fetching.
   */
  const silentRefetch = useCallback(() => {
    return globalMutate(SESSIONS_URL, undefined, { revalidate: true, populateCache: false });
  }, []);

  return { data, loading, error, mutate, revalidate: mutate, silentRefetch };
}

export function useDeleteSession() {
  const [, deleteLoading, deleteError, trigger] = useDelete({
    withAuth: true,
    disableRetries: true,
  });

  const deleteSession = async (sessionId, magicLink = null) => {
    const params = magicLink ? `?magic_link=${encodeURIComponent(magicLink)}` : '';
    return trigger(`/v1/auth/sessions${params}`, { session_id: sessionId });
  };

  return { loading: deleteLoading, error: deleteError, deleteSession };
}

/**
 * Reactive hook for magic link sessions.
 * Pass magicLink to trigger fetch - returns null URL when magicLink is null (skips request).
 */
export function useFetchSessionsWithMagicLink(magicLink) {
  return useGet(
    magicLink ? `/v1/auth/sessions?magic_link=${encodeURIComponent(magicLink)}` : null,
    {
      withAuth: false,
      noCache: true,
    }
  );
}
