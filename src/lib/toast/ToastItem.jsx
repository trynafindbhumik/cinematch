'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

import { toastVariants } from './constants';
import { useToastContext } from './ToastContext';
import styles from './ToastItem.module.css';

const SWIPE_THRESHOLD = 80;
// Rubber-band resistance for leftward (reverse) drag — lower = stiffer
const LEFT_DRAG_RESISTANCE = 0.12;

const icons = {
  [toastVariants.SUCCESS]: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  [toastVariants.ERROR]: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  [toastVariants.WARNING]: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  [toastVariants.INFO]: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  [toastVariants.LOADING]: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.spinIcon}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
};

export default function ToastItem({ toast }) {
  const { dismiss } = useToastContext();

  // translateX drives the inline transform while dragging / snapping back
  const [translateX, setTranslateX] = useState(0);
  const isExiting = toast.isExiting;

  // hasEntered becomes true once the CSS slide-in animation fires onAnimationEnd.
  // Until then we must NOT apply an inline transform, because the CSS animation
  // controls the `transform` property and would silently override any inline value
  // (animation-fill-mode: both keeps that lock even after the animation finishes).
  const [hasEntered, setHasEntered] = useState(false);

  // isDragging drives the inline `transition` — no transition while finger is down,
  // spring curve when the finger lifts so the snap-back bounces.
  const [isDragging, setIsDragging] = useState(false);

  // Tracks when we're running our own JS-driven exit animation (swipe to dismiss)
  const [isExitAnimating, setIsExitAnimating] = useState(false);

  const startXRef = useRef(0);
  const elementRef = useRef(null);

  // React to context-level dismiss (auto-timeout or dismissAll)
  // Skip if we're in our own JS-driven exit animation (swipe to dismiss)
  useEffect(() => {
    if (!isExiting || isExitAnimating) return undefined;

    const timer = setTimeout(() => dismiss(toast.id), 300);

    return () => clearTimeout(timer);
  }, [isExiting, isExitAnimating, toast.id, dismiss]);

  // Entry animation completed — release the transform lock
  const onAnimationEnd = useCallback(() => {
    // Guard: onAnimationEnd also fires for the exit animation; at that point
    // isExiting is true and we must not set hasEntered.
    if (!isExiting) {
      setHasEntered(true);
    }
  }, [isExiting]);

  // Pointer handlers
  const onPointerDown = useCallback(
    (e) => {
      // Block drag during entry animation or exit; user hasn't seen the toast yet.
      if (isExiting || !hasEntered) return;
      setIsDragging(true);
      startXRef.current = e.clientX;
      elementRef.current?.setPointerCapture(e.pointerId);
    },
    [isExiting, hasEntered]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging || isExiting) return;
      const deltaX = e.clientX - startXRef.current;

      if (deltaX >= 0) {
        // Normal rightward swipe — 1:1 follow
        setTranslateX(deltaX);
      } else {
        // Leftward drag — rubber-band: compress movement so it feels sticky
        setTranslateX(deltaX * LEFT_DRAG_RESISTANCE);
      }
    },
    [isDragging, isExiting]
  );

  const onPointerUp = useCallback(() => {
    if (!isDragging || isExiting) return;
    setIsDragging(false);

    if (translateX >= SWIPE_THRESHOLD) {
      // Animate out using inline transform (not CSS animation) so it continues
      // from where the user released instead of resetting to 0.
      setIsExitAnimating(true);
      const startX = translateX;
      const startTime = performance.now();
      const duration = 300;

      function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out curve matching the CSS animation
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentX = startX + (window.innerWidth - startX) * eased;
        setTranslateX(currentX);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          dismiss(toast.id);
        }
      }

      requestAnimationFrame(animate);
    } else {
      // Below threshold (or leftward drag) → spring back to origin
      setTranslateX(0);
    }
  }, [isDragging, isExiting, translateX, toast.id, dismiss]);

  // Derived styles
  // When the CSS animation owns the transform (entry or exit), we must not set
  // an inline transform at all — undefined lets the animation run uncontested.
  const inlineTransform =
    !hasEntered || (isExiting && !isExitAnimating) ? undefined : `translateX(${translateX}px)`;

  // Only apply the spring transition during snap-back: not during drag (direct
  // 1:1 follow), not during CSS-controlled entry/exit phases, not during JS exit animation.
  const inlineTransition =
    hasEntered && !isDragging && !isExiting && !isExitAnimating
      ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : undefined;

  const className = [
    styles.toast,
    styles[toast.variant],
    // .entering applies the slide-in @keyframes; removed once hasEntered is set
    !hasEntered && !isExiting ? styles.entering : '',
    // Only apply .exiting for non-swipe dismissals (auto-timeout, button click)
    isExiting && !isExitAnimating ? styles.exiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={elementRef}
      className={className}
      role="alert"
      style={{
        transform: inlineTransform,
        transition: inlineTransition,
      }}
      onAnimationEnd={onAnimationEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={styles.iconWrapper}>{icons[toast.variant]}</div>
      <div className={styles.content}>
        {toast.title && <p className={styles.title}>{toast.title}</p>}
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      {toast.dismissible && !isExiting && (
        <button
          className={styles.dismissBtn}
          onClick={() => dismiss(toast.id)}
          aria-label="Dismiss"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
