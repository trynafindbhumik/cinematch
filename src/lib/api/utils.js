/**
 * Converts any thrown value into a consistent { status, data, message } shape.
 *
 * Handles various backend error body formats:
 *   { message }, { error }, { detail }, { errors: [{ message }] }, plain strings
 *
 * @param {any} rawError
 * @returns {{ status: number|null, data: any, message: string }}
 */
export function normalizeError(rawError) {
  // Already normalized — pass through to avoid double-processing
  if (
    rawError &&
    'status' in rawError &&
    'data' in rawError &&
    'message' in rawError &&
    !rawError.isAxiosError &&
    !rawError.response
  ) {
    return rawError;
  }

  const status = rawError?.response?.status ?? null;
  const data = rawError?.response?.data ?? null;

  const message =
    (typeof data === 'string' && data) ||
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) && (data.errors[0]?.message || data.errors[0])) ||
    rawError?.message ||
    (status
      ? `Request failed with status ${status}`
      : 'Network error. Please check your connection.');

  return { status, data, message };
}

/**
 * Converts a plain object to FormData for multipart/form-data uploads.
 * Arrays are serialized using the PHP/Rails key[] convention.
 * Change the Array branch if your backend expects a different format (e.g. key[0], key repeated).
 * If payload is already a FormData, it's returned as-is.
 *
 * @param {Record<string, any> | FormData} payload
 * @returns {FormData}
 */
export function buildFormData(payload) {
  // If already a FormData, return as-is
  if (payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();

  function appendValue(key, value) {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else if (value instanceof Blob) {
      formData.append(key, value);
    } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      formData.append(key, new Blob([value]));
    } else if (Array.isArray(value)) {
      // PHP/Rails convention: each array element under key[]
      value.forEach((item) => appendValue(`${key}[]`, item));
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  Object.entries(payload).forEach(([k, v]) => appendValue(k, v));
  return formData;
}

/**
 * Resolves a URL from either a plain string or a factory function.
 * Factory functions allow late binding — the URL is computed at trigger-call
 * time rather than when the hook is initialized.
 *
 * @param {string | (() => string)} url
 * @returns {string}
 */
export function resolveUrl(url) {
  return typeof url === 'function' ? url() : url;
}
