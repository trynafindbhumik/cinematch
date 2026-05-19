/**
 * ============================================================================
 * Authentication Middleware Utilities
 * ============================================================================
 *
 * Provides helper functions and constants for auth middleware and components
 * Centralizes auth configuration to ensure consistency across the app
 */

// ─────────────────────────────────────────────────────────────────────────
// TOKEN CONSTANTS
// ─────────────────────────────────────────────────────────────────────────

export const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  VERIFIED: 'is_verified',
  ONBOARDING: 'needs_onboarding',
};

// ─────────────────────────────────────────────────────────────────────────
// ROUTE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/home',
  FOR_YOU: '/for-you',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  SEARCH: '/search',
  WATCHED: '/watched',
  WATCHLIST: '/watchlist',
  MOVIE_DETAIL: (id) => `/movie/${id}`,
  ABOUT: '/about',
  FAQ: '/faq',
};

// ─────────────────────────────────────────────────────────────────────────
// AUTH STATUS HELPERS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Check if a token is in valid JWT format
 * @param {string} token - Token to check
 * @returns {boolean}
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/**
 * Decode JWT without validation (for reading claims, not verification)
 * WARNING: Only use this for reading token claims. Do NOT use for security validation.
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
export function decodeTokenPayload(token) {
  try {
    if (!isValidTokenFormat(token)) return null;

    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return decoded;
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * WARNING: This is CLIENT-SIDE ONLY. Server always validates tokens.
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export function isTokenExpired(token) {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload || !payload.exp) return true;

    // exp is in seconds, convert to milliseconds
    const expiryTime = payload.exp * 1000;
    return expiryTime < Date.now();
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}

/**
 * Get time remaining until token expires (in seconds)
 * @param {string} token - JWT token
 * @returns {number|null} - Seconds until expiry, or null if invalid
 */
export function getTokenExpiry(token) {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload || !payload.exp) return null;

    const secondsRemaining = payload.exp - Math.floor(Date.now() / 1000);
    return Math.max(0, secondsRemaining);
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// REDIRECT HELPERS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Determine where to redirect authenticated users trying to access auth routes
 * Can be customized based on user onboarding status
 * @param {object} authFlags - { isVerified, needsOnboarding }
 * @returns {string} - Redirect destination URL
 */
export function getAuthenticatedUserRedirect() {
  // If user needs onboarding → redirect to onboarding flow
  // TODO: Implement based on your onboarding flow
  // if (needsOnboarding) return ROUTES.ONBOARDING;

  // Default → redirect to home/dashboard
  return ROUTES.HOME;
}

/**
 * Determine where to redirect unauthenticated users
 * Can preserve intended destination for post-login redirect
 * @param {string} intendedPath - Original path user tried to access
 * @returns {string} - Redirect destination URL with optional returnTo param
 */
export function getUnauthenticatedUserRedirect(intendedPath) {
  // Store intended path in URL for post-login redirect
  if (intendedPath && intendedPath !== ROUTES.LOGIN) {
    const loginUrl = new URL(ROUTES.LOGIN, 'http://localhost');
    loginUrl.searchParams.set('returnTo', intendedPath);
    return loginUrl.toString().replace('http://localhost', '');
  }

  return ROUTES.LOGIN;
}

// ─────────────────────────────────────────────────────────────────────────
// COOKIE HELPERS (for server-side use in middleware/API routes)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parse cookies from request header
 * @param {string} cookieHeader - Cookie header string from request
 * @returns {object} - Object with cookie names as keys
 */
export function parseCookies(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Extract specific token from request
 * @param {Request} request - NextRequest object
 * @param {string} tokenName - Token cookie name
 * @returns {string|null}
 */
export function getTokenFromRequest(request, tokenName = TOKEN_KEYS.ACCESS) {
  const cookies = parseCookies(request.headers.get('cookie'));
  return cookies[tokenName] || null;
}

// ─────────────────────────────────────────────────────────────────────────
// LOGGING & DEBUGGING
// ─────────────────────────────────────────────────────────────────────────

/**
 * Log middleware events with consistent formatting
 * @param {string} action - Action being logged
 * @param {object} data - Metadata to include
 */
export function logAuthMiddlewareEvent(action, data = {}) {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_AUTH) {
    console.log(`[AUTH_MIDDLEWARE] ${action}`, data);
  }
}

/**
 * Log security events (redirects, denials, etc.)
 * @param {string} event - Event type
 * @param {object} details - Event details
 */
export function logSecurityEvent(event, details = {}) {
  console.warn(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// MIGRATION HELPERS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get current auth status from request (for API routes)
 * @param {Request} request - NextRequest object
 * @returns {object} - { isAuthenticated: boolean, token: string|null, decoded: object|null }
 */
export function getAuthStatusFromRequest(request) {
  const token = getTokenFromRequest(request);
  const isAuthenticated = isValidTokenFormat(token) && !isTokenExpired(token);
  const decoded = isAuthenticated ? decodeTokenPayload(token) : null;

  return {
    isAuthenticated,
    token,
    decoded,
  };
}

/**
 * Create auth response with appropriate headers
 * Useful for API routes that need to update auth state
 * @param {object} responseData - Data to include in response
 * @param {object} options - { clearTokens: boolean, setHeaders: object }
 * @returns {Response}
 */
export function createAuthResponse(responseData, options = {}) {
  const { clearTokens = false, setHeaders = {} } = options;

  const response = new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...setHeaders,
    },
  });

  if (clearTokens) {
    // Clear auth cookies
    response.headers.append(
      'Set-Cookie',
      `${TOKEN_KEYS.ACCESS}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict`
    );
    response.headers.append(
      'Set-Cookie',
      `${TOKEN_KEYS.REFRESH}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict`
    );
  }

  return response;
}
