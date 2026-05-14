'use client';

import { usePost } from '@/lib/api';

export function useSignup() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const signup = async (formData) => {
    return trigger('/v1/auth/signup', formData);
  };

  return [{ data, loading, error }, signup];
}
