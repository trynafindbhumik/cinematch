'use client';

import { useCallback } from 'react';

import { usePost, useDelete } from '@/lib/api';

/**
 * Submit or clear a reaction for a movie.
 * POST /v1/reactions  { tmdb_id, reaction }
 * DELETE /v1/reactions/{tmdb_id}
 */
export function useReaction(options = {}) {
  const [, loadingPost, errorPost, triggerPost] = usePost({
    timeout: 15000,
    disableRetries: true,
    ...options,
  });

  const [, loadingDelete, errorDelete, triggerDelete] = useDelete({
    timeout: 15000,
    allowEmptyBody: true,
    disableRetries: true,
    ...options,
  });

  /**
   * @param {string} tmdbId
   * @param {'love'|'like'|'dislike'|'hate'} reactionId
   */
  const submitReaction = useCallback(
    (tmdbId, reactionId) => {
      return triggerPost('/v1/reactions', { tmdb_id: tmdbId, reaction: reactionId });
    },
    [triggerPost]
  );

  /**
   * @param {string} tmdbId
   */
  const clearReaction = useCallback(
    (tmdbId) => {
      return triggerDelete(`/v1/reactions/${tmdbId}`);
    },
    [triggerDelete]
  );

  return {
    submitReaction,
    clearReaction,
    loading: loadingPost || loadingDelete,
    error: errorPost || errorDelete,
  };
}
