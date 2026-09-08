'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { isAuthenticated, token, isLoading, logout } = useAuthContext();
  return {
    isAuthenticated,
    token,
    isLoading,
    logout,
  };
}

export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

export function usePublicRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
