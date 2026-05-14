'use client';

import { usePost } from '@/lib/api';

export function useResetPassword() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const resetPassword = async (token, newPassword) => {
    return trigger('/v1/auth/reset-password', { token, new_password: newPassword });
  };

  return [{ data, loading, error }, resetPassword];
}
