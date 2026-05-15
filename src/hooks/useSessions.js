'use client';

import { useGet, useDelete } from '@/lib/api';

export function useSessions(enabled = true) {
  const {
    data,
    loading,
    error,
    mutate: revalidate,
  } = useGet(enabled ? '/v1/auth/sessions' : null, {
    withAuth: true,
    noCache: true,
  });

  return { data, loading, error, revalidate };
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
