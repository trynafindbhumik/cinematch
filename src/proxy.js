import { NextResponse } from 'next/server';

const ROUTE_GROUPS = {
  // ✅ Public routes - accessible to everyone (no token needed)
  public: [
    '/',
    '/about',
    '/faq',
    '/terms',
    '/privacy',
    '/cookies',
    '/contact',
    '/code-of-conduct',
    '/contribute',
  ],

  // 🔐 Auth routes - only accessible when NOT authenticated
  // When token exists, user redirects to dashboard
  auth: ['/login', '/signup', '/verify', '/forgot-password', '/reset-password'],

  // 🛡️ Protected routes - only accessible when authenticated
  // When token absent, user redirects to login
  protected: ['/home', '/for-you', '/movie/:id', '/search', '/watched', '/watchlist', '/profile'],
};

/**
 * Extract the access token from request cookies
 * @param {Request} request - NextRequest object
 * @returns {string|null} - Access token or null
 */
function getAccessToken(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map((c) => c.trim());

    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'accessToken' && value) {
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing cookies in middleware:', error);
    return null;
  }
}

/**
 * Determine if a route path matches any route pattern
 * Supports both exact matches and dynamic segments (e.g., /movie/:id)
 * @param {string} pathname - Current request path
 * @param {string[]} routes - List of route patterns
 * @returns {boolean} - True if pathname matches any route pattern
 */
function matchesRoute(pathname, routes) {
  return routes.some((route) => {
    // Exact match
    if (route === pathname) return true;

    // Dynamic segment match (e.g., /movie/:id matches /movie/123)
    const routeParts = route.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length !== pathParts.length) return false;

    return routeParts.every(
      (part, index) =>
        part === pathParts[index] || // Exact segment match
        part.startsWith(':') // Dynamic segment (e.g., :id)
    );
  });
}

/**
 * Determine route type for a given pathname
 * @param {string} pathname - Current request path
 * @returns {'public'|'auth'|'protected'|null} - Route type or null if unknown
 */
function getRouteType(pathname) {
  if (matchesRoute(pathname, ROUTE_GROUPS.public)) return 'public';
  if (matchesRoute(pathname, ROUTE_GROUPS.auth)) return 'auth';
  if (matchesRoute(pathname, ROUTE_GROUPS.protected)) return 'protected';
  return null;
}

/**
 * Validate token format (basic check)
 * In production, consider JWT signature validation
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token appears valid
 */
function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false;

  // Basic JWT format check: should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Ensure each part is not empty
  return parts.every((part) => part.length > 0);
}

export default function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const accessToken = getAccessToken(request);
  const isAuthenticated = isTokenValid(accessToken);

  // Log for debugging (remove in production)
  console.log(`[AUTH_MIDDLEWARE] ${pathname}`, {
    isAuthenticated,
    hasToken: !!accessToken,
  });

  // Determine route type
  const routeType = getRouteType(pathname);

  // ✅ Public routes: Always allow access (no token needed, no redirect)
  if (routeType === 'public') {
    return NextResponse.next();
  }

  // 🔐 Auth routes (login, signup, verify, etc.)
  if (routeType === 'auth') {
    // ✓ If token exists → Redirect to dashboard/home
    if (isAuthenticated) {
      console.log(
        `[AUTH_MIDDLEWARE] Authenticated user accessing auth route. Redirecting to /home`
      );
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // ✓ If NO token → Allow access to auth route (login, signup, etc.)
    return NextResponse.next();
  }

  // 🛡️ Protected routes (home, profile, watchlist, etc.)
  if (routeType === 'protected') {
    // ✗ If NO token → Redirect to login
    if (!isAuthenticated) {
      console.log(
        `[AUTH_MIDDLEWARE] Unauthenticated user accessing protected route. Redirecting to /login`
      );
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✓ If token exists → Allow access
    // (Backend API will handle token refresh/validation)
    return NextResponse.next();
  }

  // Unknown route type → Allow access by default
  return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────────────────
// MIDDLEWARE CONFIG
// ─────────────────────────────────────────────────────────────────────────

export const config = {
  // Apply middleware to all routes except static assets and API routes
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     * - public files (.png, .jpg, .svg, .webp, .js, .css, .txt, .xml, .json, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|js|css|txt|xml|json|md)$).*)',
  ],
};
