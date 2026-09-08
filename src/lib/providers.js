'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, ToastContainer } from '@/lib/toast';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
}
