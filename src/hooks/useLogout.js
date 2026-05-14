'use client';

import { usePost } from '@/lib/api';
import { clearAuthTokens } from '@/lib/api/auth';

export function useLogout() {
  const [data, loading, error, trigger] = usePost({
    withAuth: true,
    disableRetries: true,
  });

  const logout = async () => {
    try {
      await trigger('/v1/auth/logout', {});
    } finally {
      clearAuthTokens();
    }
  };

  return [{ data, loading, error }, logout];
}
