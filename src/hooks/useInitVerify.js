'use client';

import { usePost } from '@/lib/api';

/**
 * Hook for initiating email verification (sends OTP to logged-in user's email)
 * POST /v1/auth/init-verify
 * Returns [data, loading, error, trigger]
 */
export function useInitVerify(options = {}) {
  return usePost({
    withAuth: true,
    disableRetries: true,
    ...options,
  });
}
