'use client';

import { usePost } from '@/lib/api';

export function useResendVerification(options = {}) {
  return usePost({
    withAuth: false,
    disableRetries: true,
    ...options,
  });
}
