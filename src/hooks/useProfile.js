'use client';

import { useGet, usePost, usePut, useDelete } from '@/lib/api';

/**
 * Hook for fetching current user profile
 * GET /v1/profile/me
 */
export function useProfile() {
  return useGet('/v1/profile/me');
}

/**
 * Hook for updating profile (name, avatar, smartSuggest)
 * PUT /v1/profile/me
 * Returns [data, loading, error, trigger]
 */
export function useUpdateProfile(options = {}) {
  return usePut({
    asFormData: true,
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for deleting profile picture
 * DELETE /v1/profile/me/picture
 * Returns [data, loading, error, trigger]
 */
export function useDeleteProfilePicture(options = {}) {
  return useDelete({
    allowEmptyBody: true,
    disableRetries: true,
    revalidateKeys: ['/v1/profile/me'],
    ...options,
  });
}

/**
 * Hook for initiating email change (sends OTP to old email)
 * POST /v1/profile/email/change
 * Returns [data, loading, error, trigger]
 */
export function useInitiateEmailChange(options = {}) {
  return usePost({
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for resending email change OTP
 * POST /v1/profile/email/resend
 * Returns [data, loading, error, trigger]
 */
export function useResendEmailChangeOtp(options = {}) {
  return usePost({
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for verifying email (email change flow)
 * POST /v1/profile/verify
 * Returns [data, loading, error, trigger]
 */
export function useVerifyEmail(options = {}) {
  return usePost({
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for changing password
 * PUT /v1/profile/password
 * Returns [data, loading, error, trigger]
 */
export function useChangePassword(options = {}) {
  return usePut({
    disableRetries: true,
    ...options,
  });
}

/**
 * Hook for deleting account
 * DELETE /v1/profile/me
 * Returns [data, loading, error, trigger]
 */
export function useDeleteAccount(options = {}) {
  return useDelete({
    disableRetries: true,
    ...options,
  });
}
