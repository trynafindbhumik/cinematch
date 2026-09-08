'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { isTokenExpired, isValidTokenFormat } from '@/lib/auth/middleware-utils';
import { getCookie, removeCookie } from '@/lib/cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const AuthContext = createContext(null);

function getInitialAuthState() {
  if (typeof document === 'undefined') {
    return { isAuthenticated: false, token: null, isLoading: true, user: null };
  }
  try {
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (!token || !isValidTokenFormat(token) || isTokenExpired(token)) {
      if (token && isTokenExpired(token)) {
        removeCookie(ACCESS_TOKEN_KEY);
        removeCookie(REFRESH_TOKEN_KEY);
      }
      return { isAuthenticated: false, token: null, isLoading: false, user: null };
    }
    return { isAuthenticated: true, token, isLoading: false, user: null };
  } catch {
    return { isAuthenticated: false, token: null, isLoading: false, user: null };
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState(getInitialAuthState);

  const syncAuth = useCallback(() => {
    setAuthState(getInitialAuthState());
  }, []);

  useEffect(() => {
    const handleCookieChange = () => syncAuth();
    window.addEventListener('cinematch:cookie-change', handleCookieChange);
    return () => {
      window.removeEventListener('cinematch:cookie-change', handleCookieChange);
    };
  }, [syncAuth]);

  const logout = useCallback(() => {
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    removeCookie('is_verified');
    removeCookie('needs_onboarding');
    syncAuth();
    router.push('/login');
  }, [router, syncAuth]);

  return (
    <AuthContext.Provider value={{ ...authState, syncAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
