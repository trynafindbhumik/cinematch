'use client';

import { useGet, usePost, useDelete } from '@/lib/api';

/**
 * Hook for fetching all favorite TMDB IDs
 * GET /v1/favorites/ids
 * Returns { data, error, loading, mutate }
 */
export function useFavoriteIds(options = {}) {
  return useGet('/v1/favorites/ids', options);
}

/**
 * Hook for adding movies to favorites
 * POST /v1/favorites
 * Returns [data, loading, error, trigger]
 *
 * Uses extended timeout (30s) because backend may perform complex operations
 * (external API calls, data enrichment, etc.) that can take time.
 *
 * Note: Does NOT auto-revalidate via revalidateKeys - the component manually
 * calls mutate() after the request completes to avoid double-fetching.
 */
export function useAddFavorites(options = {}) {
  return usePost({
    timeout: 30000, // Extended timeout - backend performs complex operations
    disableRetries: true,
    // No revalidateKeys - component handles refetch via mutate()
    ...options,
  });
}

/**
 * Hook for removing a movie from favorites
 * DELETE /v1/favorites/{id}
 * Returns [data, loading, error, trigger]
 *
 * Uses extended timeout (30s) because backend may perform complex operations.
 *
 * Note: Does NOT auto-revalidate via revalidateKeys - the component manually
 * calls mutate() after the request completes to avoid double-fetching.
 */
export function useRemoveFavorite(options = {}) {
  return useDelete({
    timeout: 30000, // Extended timeout - backend performs complex operations
    allowEmptyBody: true,
    disableRetries: true,
    // No revalidateKeys - component handles refetch via mutate()
    ...options,
  });
}

/**
 * Hook for searching within favorites
 * GET /v1/favorites/search?q=...&limit=...&cursor=...
 * Returns { data, error, loading, mutate }
 */
export function useSearchFavorites(options = {}) {
  return useGet('/v1/favorites/search', {
    swrOptions: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
    ...options,
  });
}
