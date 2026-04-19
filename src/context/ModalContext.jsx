'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ModalContext = createContext({
  openModals: new Set(),
  isModalOpen: () => false,
  openModal: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }) {
  const [openModals, setOpenModals] = useState(new Set());

  const isModalOpen = useCallback((modalId) => openModals.has(modalId), [openModals]);

  const openModal = useCallback((modalId) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.add(modalId);
      return next;
    });
  }, []);

  const closeModal = useCallback((modalId) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (openModals.size > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openModals.size]);

  const value = useMemo(
    () => ({ openModals, isModalOpen, openModal, closeModal }),
    [openModals, isModalOpen, openModal, closeModal]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  return useContext(ModalContext);
}
