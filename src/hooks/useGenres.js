'use client';

import { mutate as globalMutate } from 'swr';

import { useGet, usePost, useDelete } from '@/lib/api';

/**
 * Hook for fetching all available genres
 * GET /v1/genres
 */
export function useGenres() {
  return useGet('/v1/genres');
}

/**
 * Hook for fetching user's selected genres
 * GET /v1/genres/mine
 */
export function useUserGenres() {
  const result = useGet('/v1/genres/mine', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Manual revalidate function that preserves existing cache during background refresh
  const revalidate = () => {
    globalMutate('/v1/genres/mine', undefined, { revalidate: true, populateCache: false });
  };

  return {
    ...result,
    revalidate,
  };
}

/**
 * Hook for adding a genre to user's preferences
 * POST /v1/genres/{genreId}
 * Returns [data, loading, error, trigger]
 *
 * Note: No revalidateKeys here - we handle revalidation manually in the component
 * using useUserGenres().revalidate() to avoid cache clearing issues
 */
export function useAddGenre(options = {}) {
  return usePost({
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for removing a genre from user's preferences
 * DELETE /v1/genres/{genreId}
 * Returns [data, loading, error, trigger]
 *
 * Note: No revalidateKeys here - we handle revalidation manually in the component
 * using useUserGenres().revalidate() to avoid cache clearing issues
 */
export function useRemoveGenre(options = {}) {
  return useDelete({
    allowEmptyBody: true,
    disableRetries: true,
    ...options,
  });
}
