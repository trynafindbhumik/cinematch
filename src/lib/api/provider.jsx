'use client';

import { SWRConfig } from 'swr';

import { globalConfig } from './config';

/**
 * Optional SWR global configuration wrapper.
 *
 * The hooks from this library already apply globalConfig.swrDefaults individually,
 * so this component is only needed if you want the same defaults to also apply
 * to third-party SWR hooks in your app.
 *
 * @example
 * // app/layout.js
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function ApiProvider({ children }) {
  return (
    <SWRConfig value={{ ...globalConfig.swrDefaults, shouldRetryOnError: false }}>
      {children}
    </SWRConfig>
  );
}
