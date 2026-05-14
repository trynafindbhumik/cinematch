'use client';

import { usePut } from '@/lib/api';

/**
 * Hook for disabling user account temporarily
 * PUT /v1/profile/disable
 * Returns [data, loading, error, trigger]
 */
export function useDisableAccount(options = {}) {
  return usePut({
    disableRetries: true,
    ...options,
  });
}
