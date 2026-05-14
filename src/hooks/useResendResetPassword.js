'use client';

import { usePost } from '@/lib/api';

export function useResendResetPassword() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const resendReset = async (email) => {
    return trigger('/v1/auth/resend-reset', { email });
  };

  return [{ data, loading, error }, resendReset];
}
