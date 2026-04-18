'use client';

import { useRef, useEffect } from 'react';

const DISTANCE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.45;
const CLOSE_ANIMATION_MS = 320;

export function useSwipeToClose(onClose, enabled = true) {
  const sheetRef = useRef(null);
  const dragHandleRef = useRef(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const handle = dragHandleRef.current;
    const sheet = sheetRef.current;
    if (!handle || !sheet) return undefined;

    const gesture = {
      startY: 0,
      startTime: 0,
      lastY: 0,
      active: false,
    };

    function applyTranslate(delta) {
      sheet.style.transform = `translateY(${delta}px)`;
    }

    function resetStyles() {
      if (sheetRef.current) {
        sheetRef.current.style.animation = '';
        sheetRef.current.style.transform = '';
        sheetRef.current.style.transition = '';
        sheetRef.current.style.willChange = '';
      }
    }

    function onTouchStart(e) {
      gesture.startY = e.touches[0].clientY;
      gesture.startTime = performance.now();
      gesture.lastY = e.touches[0].clientY;
      gesture.active = true;

      sheet.style.animation = 'none';
      sheet.style.transition = 'none';
      sheet.style.willChange = 'transform';
    }

    function onTouchMove(e) {
      if (!gesture.active) return;

      const delta = e.touches[0].clientY - gesture.startY;
      gesture.lastY = e.touches[0].clientY;

      if (delta > 0) {
        e.preventDefault();
        applyTranslate(delta);
      }
    }

    function onTouchEnd() {
      if (!gesture.active) return;
      gesture.active = false;

      const delta = gesture.lastY - gesture.startY;
      const elapsed = performance.now() - gesture.startTime;
      const velocity = elapsed > 0 ? delta / elapsed : 0;

      const shouldClose =
        delta > DISTANCE_THRESHOLD || (delta > 40 && velocity > VELOCITY_THRESHOLD);

      sheet.style.transition = `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;
      sheet.style.willChange = '';

      if (shouldClose) {
        applyTranslate(window.innerHeight);
        window.setTimeout(() => {
          onCloseRef.current();
          resetStyles();
        }, CLOSE_ANIMATION_MS);
      } else {
        sheet.style.transform = '';
      }
    }

    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    handle.addEventListener('touchmove', onTouchMove, { passive: false });
    handle.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      handle.removeEventListener('touchstart', onTouchStart);
      handle.removeEventListener('touchmove', onTouchMove);
      handle.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled]);

  return { sheetRef, dragHandleRef };
}
