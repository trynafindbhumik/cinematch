'use client';

import { setCookie, removeCookie } from '@/lib/cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const COOKIE_EXPIRES_DAYS = 7;

export function saveAuthTokens({ accessToken, refreshToken }) {
  if (!accessToken) return;
  setCookie(ACCESS_TOKEN_KEY, accessToken, COOKIE_EXPIRES_DAYS);
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_KEY, refreshToken, COOKIE_EXPIRES_DAYS);
  }
}

export function saveAuthFlags({ isVerified, needsOnboarding }) {
  if (typeof isVerified === 'boolean') {
    setCookie('is_verified', String(isVerified), COOKIE_EXPIRES_DAYS);
  }
  if (typeof needsOnboarding === 'boolean') {
    setCookie('needs_onboarding', String(needsOnboarding), COOKIE_EXPIRES_DAYS);
  }
}

export function clearAuthTokens() {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
  removeCookie('is_verified');
  removeCookie('needs_onboarding');
}
