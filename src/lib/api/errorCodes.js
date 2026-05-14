/**
 * Maps HTTP status codes to user-friendly error messages for auth flows.
 * Frontend messages take precedence; backend messages used as fallback when appropriate.
 */

export const AUTH_ERROR_MESSAGES = {
  // 400 Bad Request - Client sent malformed request
  400: 'Invalid request. Please check your input and try again.',

  // 401 Unauthorized - Invalid credentials
  401: 'Invalid email or password. Please check your credentials and try again.',

  // 403 Forbidden - Valid credentials but insufficient permissions
  403: 'You do not have permission to perform this action.',

  // 404 Not Found - Resource doesn't exist
  404: 'The requested resource was not found.',

  // 409 Conflict - Email already exists, etc.
  409: 'An account with this email already exists. Try signing in instead.',

  // 410 Gone - Resource permanently removed (e.g., user deleted)
  410: 'This account no longer exists.',

  // 422 Unprocessable Entity - Validation errors
  422: 'Please check your input. Some fields are invalid or missing.',

  // 429 Too Many Requests - Rate limited
  429: 'Too many attempts. Please wait a moment before trying again.',

  // 500 Internal Server Error
  500: 'Something went wrong on our end. Please try again later.',

  // 502 Bad Gateway
  502: 'Service temporarily unavailable. Please try again later.',

  // 503 Service Unavailable
  503: 'Server is under maintenance. Please try again in a few minutes.',
};

/**
 * Generic fallback for unknown status codes
 */
export const DEFAULT_ERROR_MESSAGE =
  'Something unexpected happened. Please try again or contact support if the problem persists.';

/**
 * Gets a user-friendly message for a given status code.
 *
 * @param {number|null} status - HTTP status code
 * @param {Object} [customMessages] - Optional custom message map to use
 * @param {string} [fallbackMessage] - Optional backend message to use as fallback
 * @returns {{ code: number|null, message: string, isFrontendMessage: boolean }}
 */
export function getErrorMessage(status, customMessages = null, fallbackMessage = null) {
  const messageMap = customMessages || AUTH_ERROR_MESSAGES;
  const statusCode = status ?? 0;

  // Try custom messages first (e.g., signup-specific), then generic auth, then default
  const frontendMessage =
    (customMessages && messageMap[statusCode]) ||
    AUTH_ERROR_MESSAGES[statusCode] ||
    DEFAULT_ERROR_MESSAGE;

  // Use frontend message if available, otherwise fallback to backend message
  const finalMessage = frontendMessage || fallbackMessage || DEFAULT_ERROR_MESSAGE;

  return {
    code: statusCode || null,
    message: finalMessage,
    isFrontendMessage: !!frontendMessage,
  };
}
