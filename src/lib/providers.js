'use client';

import { ToastProvider, ToastContainer } from '@/lib/toast';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
