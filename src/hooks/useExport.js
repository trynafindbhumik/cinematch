'use client';

import { usePost } from '@/lib/api';

/**
 * Hook for requesting data export
 * POST /v1/export
 * Returns [data, loading, error, trigger]
 */
export function useExport(options = {}) {
  return usePost({
    disableRetries: true,
    ...options,
  });
}
