import { Suspense } from 'react';

import ResetPassword from '@/components/auth/resetPassword/ResetPassword';

export const metadata = {
  title: 'Reset Password · CineMatch',
};

function LoadingState() {
  return null;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPassword />
    </Suspense>
  );
}
