'use client';

import { usePost } from '@/lib/api';

export function useVerifyOtp() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const verifyOtp = async ({ otp, verification_id }) => {
    return trigger('/v1/auth/verify', { otp: otp.toLowerCase(), verification_id });
  };

  return [{ data, loading, error }, verifyOtp];
}
