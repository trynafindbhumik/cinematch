'use client';

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

import { getCookie, setCookie } from '@/utils/cookie';

const SidebarContext = createContext(undefined);

const COOKIE_NAME = 'cinematch:sidebar-collapsed';

function subscribe(callback) {
  const interval = setInterval(callback, 500);
  return () => clearInterval(interval);
}

export function SidebarProvider({ children, initialCollapsed }) {
  const stored = useSyncExternalStore(
    subscribe,
    () => getCookie(COOKIE_NAME),
    () => initialCollapsed
  );

  const isCollapsed =
    typeof stored === 'boolean'
      ? stored
      : stored === null
        ? (initialCollapsed ?? false)
        : stored === 'true';

  const toggleSidebar = useCallback(() => {
    const current = getCookie(COOKIE_NAME);
    const next = current !== 'true';
    setCookie(COOKIE_NAME, String(next));
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
