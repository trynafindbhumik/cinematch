'use client';

import { setCookie, removeCookie } from '@/lib/cookie';

import { globalConfig } from './config';

/**
 * Persists auth tokens to cookies using the same keys and options as the
 * rest of the API layer. Call immediately after a successful login so the
 * request interceptor can attach the token on the very next request.
 *
 * @param {{ accessToken: string, refreshToken?: string }} tokens
 *
 * @example
 * const result = await trigger('/auth/login', { email, password });
 * saveAuthTokens({ accessToken: result.token, refreshToken: result.refreshToken });
 */
export function saveAuthTokens({ accessToken, refreshToken }) {
  if (!accessToken) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[api] saveAuthTokens() was called without an accessToken.');
    }
    return;
  }

  const { expires, ...cookieRest } = globalConfig.cookieOptions;
  setCookie(globalConfig.accessTokenKey, accessToken, expires, cookieRest);

  if (refreshToken) {
    setCookie(globalConfig.refreshTokenKey, refreshToken, expires, cookieRest);
  }
}

/**
 * Stores user state flags in cookies.
 * Call after login/signup to persist is_verified and needs_onboarding.
 *
 * @param {{ isVerified?: boolean, needsOnboarding?: boolean }} flags
 *
 * @example
 * saveAuthFlags({ isVerified: result.is_verified, needsOnboarding: result.needs_onboarding });
 */
export function saveAuthFlags({ isVerified, needsOnboarding }) {
  const { expires, ...cookieRest } = globalConfig.cookieOptions;

  if (typeof isVerified === 'boolean') {
    setCookie('is_verified', String(isVerified), expires, cookieRest);
  }

  if (typeof needsOnboarding === 'boolean') {
    setCookie('needs_onboarding', String(needsOnboarding), expires, cookieRest);
  }
}

/**
 * Removes all auth cookies including user state flags. Use in logout handlers.
 *
 * @example
 * clearAuthTokens();
 * router.push('/login');
 */
export function clearAuthTokens() {
  removeCookie(globalConfig.accessTokenKey);
  removeCookie(globalConfig.refreshTokenKey);
  removeCookie('is_verified');
  removeCookie('needs_onboarding');
}
