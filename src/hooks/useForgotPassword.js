'use client';

import { usePost } from '@/lib/api';

export function useForgotPassword() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const forgotPassword = async (email) => {
    return trigger('/v1/auth/forgot-password', { email });
  };

  return [{ data, loading, error }, forgotPassword];
}
