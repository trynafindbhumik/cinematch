'use client';

import { usePost } from '@/lib/api';
import { saveAuthTokens, saveAuthFlags } from '@/lib/api/auth';

export function useLogin() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
    extraNoRetryStatusCodes: [404],
  });

  const login = async (formData) => {
    const result = await trigger('/v1/auth/login', formData);
    if (result?.access_token) {
      saveAuthTokens({ accessToken: result.access_token });
      saveAuthFlags({
        isVerified: result.is_verified,
        needsOnboarding: result.needs_onboarding,
      });
    }
    return result;
  };

  return [{ data, loading, error }, login];
}
