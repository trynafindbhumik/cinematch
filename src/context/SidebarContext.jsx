'use client';

import { createContext, useContext, useCallback, useState } from 'react';

import { getCookie, setCookie } from '@/utils/cookie';

const SidebarContext = createContext(undefined);

const COOKIE_NAME = 'cinematch:sidebar-collapsed';

export function SidebarProvider({ children, initialCollapsed }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return initialCollapsed ?? false;
    }

    const stored = getCookie(COOKIE_NAME);
    if (stored !== null) {
      return stored === 'true';
    }

    return initialCollapsed ?? false;
  });

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      setCookie(COOKIE_NAME, String(next));
      return next;
    });
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
