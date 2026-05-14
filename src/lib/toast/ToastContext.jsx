import { createContext, useContext, useState, useCallback, useRef } from 'react';

import { toastDefaults, toastVariants } from './constants';

const MAX_TOASTS = 4;

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    ({ id, variant, title, message, duration, dismissible }) => {
      const toastId = id || `toast-${++toastIdCounter}`;

      setToasts((prev) => {
        // activeToasts is ordered newest-first because we always prepend.
        // The *oldest* toast is therefore at the end of the array.
        const activeToasts = prev.filter((t) => !t.isExiting);

        if (activeToasts.length >= MAX_TOASTS) {
          // ✅ Fix: evict the OLDEST active toast (last in the array), not [0]
          // which was the newest and caused a cascade of wrong evictions.
          const oldestActive = activeToasts[activeToasts.length - 1];

          const updatedPrev = prev.map((t) =>
            t.id === oldestActive.id ? { ...t, isExiting: true } : t
          );

          return [
            { id: toastId, variant, title, message, dismissible, isExiting: false },
            ...updatedPrev,
          ];
        }

        return [{ id: toastId, variant, title, message, dismissible, isExiting: false }, ...prev];
      });

      if (duration && duration !== Infinity) {
        const timer = setTimeout(() => {
          setToasts((current) =>
            current.map((t) => (t.id === toastId ? { ...t, isExiting: true } : t))
          );
          setTimeout(() => removeToast(toastId), 300);
        }, duration);
        timersRef.current.set(toastId, timer);
      }

      return toastId;
    },
    [removeToast]
  );

  const toast = useCallback(
    (options) => {
      const { variant = 'info', duration = toastDefaults.duration } = options;
      return addToast({
        ...options,
        duration: variant === toastVariants.LOADING ? toastDefaults.loadingDuration : duration,
      });
    },
    [addToast]
  );

  const dismiss = useCallback(
    (id) => {
      setToasts((current) => current.map((t) => (t.id === id ? { ...t, isExiting: true } : t)));
      setTimeout(() => removeToast(id), 300);
    },
    [removeToast]
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const value = {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
