import { Suspense } from 'react';

import Verify from '@/components/auth/verify/Verify';

export const metadata = {
  title: 'Verify Email · CineMatch',
};

function LoadingState() {
  return null;
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Verify />
    </Suspense>
  );
}
