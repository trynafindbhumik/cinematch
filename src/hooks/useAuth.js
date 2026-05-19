'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { isTokenExpired, getTokenExpiry, isValidTokenFormat } from '@/lib/auth/middleware-utils';
import { getCookie, removeCookie } from '@/lib/cookie';

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};

/**
 * ============================================================================
 * useAuth Hook
 * ============================================================================
 *
 * Client-side hook for checking authentication status and managing auth state
 * Works in conjunction with middleware.js for complete auth flow
 *
 * Usage:
 *   const { isAuthenticated, token, isLoading, expiresIn } = useAuth();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <div>
 *           <p>Logged in!</p>
 *           <p>Token expires in: {expiresIn} seconds</p>
 *         </div>
 *       ) : (
 *         <p>Not authenticated</p>
 *       )}
 *     </div>
 *   );
 */
export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    expiresIn: null,
    isLoading: true,
    error: null,
  });

  /**
   * Check auth on mount and when token changes
   */
  useEffect(() => {
    let ignore = false;

    const runCheck = () => {
      if (ignore) return;

      try {
        const token = getCookie(TOKEN_KEYS.ACCESS);

        if (!token || !isValidTokenFormat(token)) {
          if (!ignore) {
            setAuthState({
              isAuthenticated: false,
              token: null,
              expiresIn: null,
              isLoading: false,
              error: null,
            });
          }

          return;
        }

        if (isTokenExpired(token)) {
          removeCookie(TOKEN_KEYS.ACCESS);

          if (!ignore) {
            setAuthState({
              isAuthenticated: false,
              token: null,
              expiresIn: null,
              isLoading: false,
              error: 'Token expired',
            });
          }

          return;
        }

        const expiresIn = getTokenExpiry(token);

        if (!ignore) {
          setAuthState({
            isAuthenticated: true,
            token,
            expiresIn,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!ignore) {
          setAuthState({
            isAuthenticated: false,
            token: null,
            expiresIn: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown auth error',
          });
        }
      }
    };

    runCheck();

    const handleCookieChange = () => {
      runCheck();
    };

    window.addEventListener('cinematch:cookie-change', handleCookieChange);

    return () => {
      ignore = true;

      window.removeEventListener('cinematch:cookie-change', handleCookieChange);
    };
  }, []);

  /**
   * Check token expiry periodically (every 30 seconds)
   * If token is about to expire, trigger refresh
   */
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.expiresIn) {
      return undefined;
    }

    const interval = setInterval(() => {
      const token = getCookie(TOKEN_KEYS.ACCESS);

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          token: null,
          expiresIn: null,
          isLoading: false,
          error: null,
        });

        return;
      }

      const expiresIn = getTokenExpiry(token);

      if (expiresIn && expiresIn < 60) {
        console.warn('[useAuth] Token expiring soon, triggering refresh');

        window.dispatchEvent(new CustomEvent('auth:token-expiring-soon'));
      }

      setAuthState((prev) => ({
        ...prev,
        expiresIn,
      }));
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [authState.isAuthenticated, authState.expiresIn]);

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    expiresIn: authState.expiresIn,
    isLoading: authState.isLoading,
    error: authState.error,
  };
}

/**
 * ============================================================================
 * useProtectedRoute Hook
 * ============================================================================
 *
 * Redirect to login if not authenticated
 * Useful for client components that need auth verification
 *
 * Note: Middleware already handles this server-side, but this provides
 * an additional safety check for client components
 *
 * Usage:
 *   const { isAuthenticated, isLoading } = useProtectedRoute();
 *
 *   if (isLoading) return <LoadingComponent />;
 *   if (!isAuthenticated) return null; // Redirect happens automatically
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[useProtectedRoute] Not authenticated, redirecting to login');

      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * ============================================================================
 * usePublicRoute Hook
 * ============================================================================
 *
 * Redirect to home if already authenticated
 * Useful for auth pages (login, signup) that should redirect logged-in users
 *
 * Usage:
 *   const { isAuthenticated, isLoading } = usePublicRoute();
 *
 *   if (isLoading) return <LoadingComponent />;
 *   if (isAuthenticated) return null; // Redirect happens automatically
 */
export function usePublicRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('[usePublicRoute] Already authenticated, redirecting to home');

      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * ============================================================================
 * useAuthGuard Hook
 * ============================================================================
 *
 * Advanced hook for fine-grained auth control
 * Allows specifying required roles, checking permissions, etc.
 *
 * Usage:
 *   const { hasAccess, isLoading } = useAuthGuard({
 *     requireAuth: true,
 *     requiredRoles: ['admin', 'moderator'],
 *     onUnauthorized: () => router.push('/unauthorized'),
 *   });
 */
export function useAuthGuard(options = {}) {
  const router = useRouter();

  const { isAuthenticated, isLoading } = useAuth();

  const {
    requireAuth = false,
    requiredRoles = [],
    onUnauthorized = () => router.replace('/login'),
  } = options;

  /**
   * Handle unauthorized access
   */
  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      console.log('[useAuthGuard] Authentication required but not authenticated');

      onUnauthorized();
    }
  }, [isAuthenticated, isLoading, requireAuth, onUnauthorized]);

  /**
   * Derived access state
   * Avoids setState inside useEffect
   */
  const hasAccess = useMemo(() => {
    // Public route
    if (!requireAuth) {
      return true;
    }

    // Protected route
    if (requireAuth && isAuthenticated) {
      return true;
    }

    // Future role checking can go here
    if (requiredRoles.length > 0) {
      // Implement role logic later
    }

    return false;
  }, [requireAuth, isAuthenticated, requiredRoles]);

  return {
    hasAccess,
    isLoading,
  };
}
