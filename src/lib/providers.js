'use client';

import { configureApi, ApiProvider } from '@/lib/api';
import { ToastProvider, ToastContainer } from '@/lib/toast';

// Call at module level — before any component renders or any request is made.
// Wrapping this in useEffect would run it after the first render, which is too
// late and triggers a dev warning from configureApi itself.
configureApi({
  timeout: 15000,
  onUnauthorized: async () => {
    // Guard against SSR — this only fires after a failed token refresh in the browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  onGlobalError: (err) => {
    // Only log meaningful errors in development (not aborted/cancelled requests)
    // Skip 401/403 as these are expected auth errors (invalid credentials, forbidden)
    if (
      process.env.NODE_ENV === 'development' &&
      err?.status &&
      err?.message &&
      err.status !== 401 &&
      err.status !== 403
    ) {
      // eslint-disable-next-line no-console
      console.error(`[API Error] ${err.status}: ${err.message}`);
    }
  },
  swrDefaults: {
    revalidateOnFocus: false,
  },
});

export default function Providers({ children }) {
  return (
    <ApiProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </ApiProvider>
  );
}
