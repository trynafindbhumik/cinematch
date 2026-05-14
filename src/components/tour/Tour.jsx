'use client';

import clsx from 'clsx';
import { X, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';

import Button from '@/components/ui/button/Button';
import { useTour, TOUR_STEPS } from '@/context/TourContext';

import styles from './Tour.module.css';

const PAD = 8;
const ANIM_MS = 380;
const SETTLE_MS = 400;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function Tour() {
  const router = useRouter();

  const {
    isActive,
    showFinish,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
  } = useTour();

  const [popoverPos, setPopoverPos] = useState({
    top: -9999,
    left: -9999,
  });

  const [popoverVisible, setPopoverVisible] = useState(false);

  // derived instead of state
  const highlightVisible = isActive;

  // refs
  const svgCutoutRef = useRef(null);
  const highlightRef = useRef(null);
  const popoverRef = useRef(null);
  const rafRef = useRef(null);
  const mutObsRef = useRef(null);
  const resizeObsRef = useRef(null);
  const currentRectRef = useRef(null);
  const abortRef = useRef(null); // AbortController for cancelling stale ops

  // Helpers

  const writeRectToDOM = useCallback((r) => {
    const x = r.left - PAD;
    const y = r.top - PAD;
    const w = r.width + PAD * 2;
    const h = r.height + PAD * 2;

    if (svgCutoutRef.current) {
      svgCutoutRef.current.setAttribute('x', x);
      svgCutoutRef.current.setAttribute('y', y);
      svgCutoutRef.current.setAttribute('width', w);
      svgCutoutRef.current.setAttribute('height', h);
    }

    if (highlightRef.current) {
      const s = highlightRef.current.style;

      s.top = `${y}px`;
      s.left = `${x}px`;
      s.width = `${w}px`;
      s.height = `${h}px`;
    }
  }, []);

  const applyPopoverPos = useCallback(
    (r) => {
      if (!popoverRef.current) return;

      const pop = popoverRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 16;

      let top = 0;
      let left = 0;

      switch (currentStep?.side) {
        case 'top':
          top = r.top - PAD - pop.height - gap;
          left = r.left + r.width / 2 - pop.width / 2;
          break;

        case 'bottom':
          top = r.bottom + PAD + gap;
          left = r.left + r.width / 2 - pop.width / 2;
          break;

        case 'left':
          top = r.top + r.height / 2 - pop.height / 2;
          left = r.left - PAD - pop.width - gap;
          break;

        case 'right':
          top = r.top + r.height / 2 - pop.height / 2;
          left = r.right + PAD + gap;
          break;

        default:
          top = vh / 2 - pop.height / 2;
          left = vw / 2 - pop.width / 2;
      }

      left = Math.max(16, Math.min(left, vw - pop.width - 16));
      top = Math.max(16, Math.min(top, vh - pop.height - 16));

      setPopoverPos({ top, left });
    },
    [currentStep?.side]
  );

  const snapRect = useCallback(
    (rect) => {
      cancelAnimationFrame(rafRef.current);

      writeRectToDOM(rect);
      currentRectRef.current = rect;
    },
    [writeRectToDOM]
  );

  const animateToRect = useCallback(
    (from, to, onDone) => {
      cancelAnimationFrame(rafRef.current);

      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / ANIM_MS, 1);
        const e = easeInOutCubic(t);

        const l = (a, b) => a + (b - a) * e;

        const r = {
          top: l(from.top, to.top),
          left: l(from.left, to.left),
          width: l(from.width, to.width),
          height: l(from.height, to.height),
          right: l(from.right, to.right),
          bottom: l(from.bottom, to.bottom),
        };

        writeRectToDOM(r);
        currentRectRef.current = r;

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          currentRectRef.current = to;
          onDone?.();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [writeRectToDOM]
  );

  const attachToElement = useCallback(
    (el) => {
      const targetRect = el.getBoundingClientRect();

      if (targetRect.width === 0 && targetRect.height === 0) {
        return;
      }

      resizeObsRef.current?.disconnect();

      resizeObsRef.current = new ResizeObserver(() => {
        const r = el.getBoundingClientRect();
        if (r.width > 0) {
          snapRect(r);
          applyPopoverPos(r);
        }
      });

      resizeObsRef.current.observe(el);
      resizeObsRef.current.observe(document.documentElement);

      const prev = currentRectRef.current;

      const isCrossPage =
        !prev ||
        prev.width === 0 ||
        prev.height === 0 ||
        Math.abs(prev.top - targetRect.top) > 100 ||
        Math.abs(prev.left - targetRect.left) > 100 ||
        Math.abs(prev.width - targetRect.width) > 200 ||
        Math.abs(prev.height - targetRect.height) > 200;

      // Always show popover when attaching to a new element
      setPopoverVisible(true);

      if (!prev || isCrossPage) {
        snapRect(targetRect);
        applyPopoverPos(targetRect);
      } else {
        animateToRect(prev, targetRect, () => {
          applyPopoverPos(targetRect);
        });
      }
    },
    [snapRect, animateToRect, applyPopoverPos]
  );

  // Main effect

  useEffect(() => {
    if (!isActive || !currentStep) {
      return undefined;
    }

    // Abort any in-flight operations from previous step
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const target = currentStep.target;
    const stepKey = `${currentStepIndex}-${currentStep.id}`; // stable identifier

    // Reset visibility on next frame to avoid sync state update in effect
    requestAnimationFrame(() => {
      if (!abortRef.current?.signal.aborted) {
        setPopoverVisible(false);
      }
    });

    mutObsRef.current?.disconnect();
    resizeObsRef.current?.disconnect();
    cancelAnimationFrame(rafRef.current);

    // If element doesn't exist on current page, navigate to the step's route first
    const el = document.querySelector(target);

    if (!el && currentStep.route) {
      // Navigate to the step's route and wait for element
      mutObsRef.current = new MutationObserver(() => {
        if (abortRef.current?.signal.aborted) return;

        const found = document.querySelector(target);
        if (!found) return;

        mutObsRef.current?.disconnect();

        setTimeout(() => {
          if (abortRef.current?.signal.aborted) return;

          const fresh = document.querySelector(target);
          if (!fresh) return;

          fresh.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (abortRef.current?.signal.aborted) return;
              attachToElement(fresh, stepKey);
            });
          });
        }, SETTLE_MS);
      });

      mutObsRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Navigate to the step's route
      const currentPath = window.location.pathname;
      if (currentPath !== currentStep.route) {
        router.push(currentStep.route);
      }

      return () => {
        abortRef.current?.abort();
        mutObsRef.current?.disconnect();
        cancelAnimationFrame(rafRef.current);
      };
    }

    // Element exists on current page
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const handleEl = () => {
      if (abortRef.current?.signal.aborted) return;
      attachToElement(el, stepKey);
    };

    requestAnimationFrame(handleEl);

    return () => {
      abortRef.current?.abort();
      mutObsRef.current?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, currentStep, currentStepIndex, attachToElement, router]);

  // Scroll tracking

  useEffect(() => {
    if (!isActive || !currentStep) {
      return undefined;
    }

    const onScroll = () => {
      const el = document.querySelector(currentStep.target);

      if (!el) {
        return;
      }

      const r = el.getBoundingClientRect();

      if (r.width > 0) {
        snapRect(r);
        applyPopoverPos(r);
      }
    };

    window.addEventListener('scroll', onScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll, {
        capture: true,
      });
    };
  }, [isActive, currentStep, snapRect, applyPopoverPos]);

  // Reset on deactivate

  useEffect(() => {
    if (isActive) {
      return undefined;
    }

    cancelAnimationFrame(rafRef.current);

    mutObsRef.current?.disconnect();
    resizeObsRef.current?.disconnect();

    currentRectRef.current = null;

    requestAnimationFrame(() => {
      setPopoverVisible(false);
    });

    return undefined;
  }, [isActive]);

  // Early return

  if (!isActive && !showFinish) {
    return null;
  }

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  // Finish screen

  if (showFinish) {
    return (
      <div className={styles.tourFinish}>
        <div className={styles.tourFinishCard}>
          <div className={styles.tourFinishIcon}>
            <Rocket size={28} />
          </div>
          <h2 className={styles.tourFinishTitle}>You&apos;re All Set!</h2>
          <p className={styles.tourFinishText}>
            Your cinema journey begins now. Start swiping, building your lists, and discovering
            movies you&apos;ll love.
          </p>
          <div className={styles.tourFinishTips}>
            <p className={styles.tourFinishTipsTitle}>Pro tips:</p>
            <div className={styles.tourFinishTip}>
              <span className={styles.tourFinishTipDot} />
              <span>Be honest with your swipes — it improves recommendations</span>
            </div>
            <div className={styles.tourFinishTip}>
              <span className={styles.tourFinishTipDot} />
              <span>Set your genre preferences in Profile for smarter picks</span>
            </div>
            <div className={styles.tourFinishTip}>
              <span className={styles.tourFinishTipDot} />
              <span>The more you use CineMatch, the smarter it gets</span>
            </div>
          </div>
          <div className={styles.tourFinishButtons}>
            <Button variant="cinema" size="sm" onClick={finishTour}>
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active tour

  return (
    <div className={clsx(styles.tourRoot, isActive && styles.tourRootActive)}>
      <svg className={styles.overlay} aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />

            <rect
              ref={svgCutoutRef}
              x="-9999"
              y="-9999"
              width="0"
              height="0"
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(26,26,26,0.78)"
          mask="url(#tour-mask)"
        />
      </svg>

      <div
        ref={highlightRef}
        className={clsx(styles.highlightBorder, highlightVisible && styles.highlightVisible)}
        aria-hidden="true"
      />

      <div
        ref={popoverRef}
        className={clsx(styles.popover, popoverVisible && styles.popoverVisible)}
        style={{
          top: popoverPos.top,
          left: popoverPos.left,
        }}
        role="dialog"
        aria-label={currentStep?.title}
      >
        <div className={styles.popoverHeader}>
          <div className={styles.progressDots}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={TOUR_STEPS[i]?.id ?? i}
                className={clsx(
                  styles.dot,
                  i === currentStepIndex && styles.dotActive,
                  i < currentStepIndex && styles.dotDone
                )}
              />
            ))}
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.skipBtn}
              onClick={skipTour}
              aria-label="Skip tour"
            >
              Skip
            </button>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={skipTour}
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.popoverBody}>
          <h3 className={clsx('text-xl', styles.popoverTitle)}>{currentStep?.title}</h3>

          <p className={clsx('text-base', styles.popoverDescription)}>{currentStep?.description}</p>
        </div>

        <div className={styles.popoverFooter}>
          {!isFirstStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              leftIcon={<ChevronLeft size={14} />}
            >
              Back
            </Button>
          )}

          <div className={styles.footerSpacer} />

          <span className={clsx('text-micro', styles.stepCounter)}>
            {currentStepIndex + 1} / {totalSteps}
          </span>

          <Button
            variant="cinema"
            size="sm"
            onClick={nextStep}
            rightIcon={isLastStep ? null : <ChevronRight size={14} />}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
