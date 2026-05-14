'use client';

import { usePost } from '@/lib/api';
import { VerifySchema, validateSchema } from '@/lib/validations/auth';

export function useVerifyToken() {
  const [data, loading, error, trigger] = usePost({
    withAuth: false,
    disableRetries: true,
  });

  const verifyToken = async ({ token }) => {
    const validation = validateSchema(VerifySchema, { token });
    if (!validation.success) {
      throw { status: 400, data: null, message: validation.errorMessage };
    }

    return trigger('/v1/auth/verify', validation.data);
  };

  return [{ data, loading, error }, verifyToken];
}
