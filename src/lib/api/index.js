/**
 * Public API for @/lib/api
 *
 * Setup:
 *   configureApi()          — call once at module level in your providers file
 *
 * Auth helpers:
 *   saveAuthTokens()        — call after login to persist tokens to cookies
 *   clearAuthTokens()       — call on logout to remove tokens from cookies
 *
 * Auth API functions:
 *   signup()               — POST /v1/auth/signup
 *   verifyOtp()            — POST /v1/auth/verify (OTP flow)
 *   resendVerification()   — POST /v1/auth/resend
 *
 * Validation schemas:
 *   SignupSchema           — Zod schema for signup
 *   VerifySchema           — Zod schema for OTP verification
 *   ResendSchema          — Zod schema for resend
 *
 * GET hook:
 *   useGet(url, options)    — { data, error, loading, mutate }
 *
 * Mutation hooks (all return [data, loading, error, trigger]):
 *   usePost(hookOptions)
 *   usePut(hookOptions)
 *   usePatch(hookOptions)
 *   useDelete(hookOptions)
 *
 * Optional SWR wrapper (only needed for third-party SWR hooks):
 *   ApiProvider
 */
export { configureApi } from './config';
export { saveAuthTokens, saveAuthFlags, clearAuthTokens } from './auth';
export { useGet, usePost, usePut, usePatch, useDelete } from './hooks';
export { ApiProvider } from './provider';
