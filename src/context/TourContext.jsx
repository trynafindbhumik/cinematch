'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { getCookie, setCookie } from '@/lib/cookie';

const TourContext = createContext(null);

export const TOUR_STEPS = [
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Your Cinema Hub',
    description:
      'Navigate through your cinema world from here. Discover new films, manage your watchlists, and access your profile.',
    side: 'right',
    route: '/home',
  },
  {
    id: 'for-you',
    target: '[data-tour="nav-for-you"]',
    title: 'AI Recommendations',
    description:
      'The heart of CineMatch. Swipe right to like, left to skip, and up to mark as watched. The more you swipe, the smarter your recommendations become.',
    side: 'bottom',
    route: '/home',
  },
  {
    id: 'watchlist',
    target: '[data-tour="nav-watchlist"]',
    title: 'Your Watchlist',
    description:
      'Movies you want to see next. Save films from any swipe or search to build your personal queue.',
    side: 'right',
    route: '/home',
  },
  {
    id: 'search',
    target: '[data-tour="nav-search"]',
    title: 'Find Anything',
    description:
      "Search movies by name, filter by genre, or find what's available on your favorite streaming services.",
    side: 'bottom',
    route: '/home',
  },
  {
    id: 'swipe-deck',
    target: '[data-tour="swipe-deck"]',
    title: 'Swipe to Discover',
    description:
      'Drag cards left, right, or up to react. Tap for details, swipe to react in bulk, or use the buttons below.',
    side: 'top',
    route: '/home',
  },
  {
    id: 'action-bar',
    target: '[data-tour="action-bar"]',
    title: 'React Your Way',
    description:
      'Love it, like it, skip it, or mark it watched. Each reaction teaches your AI to understand your taste.',
    side: 'top',
    route: '/home',
  },
  {
    id: 'foryou-hero',
    target: '[data-tour="foryou-hero"]',
    title: "Editor's Top Picks",
    description:
      'Hand-picked curated collections updated weekly by our film team. Browse the top 5 movies selected for you.',
    side: 'bottom',
    route: '/for-you',
  },
  {
    id: 'foryou-suggest',
    target: '[data-tour="foryou-suggest"]',
    title: 'AI Film Suggestions',
    description:
      "Tell us your mood and we'll pick the perfect film just for you. You get 3 suggestions per week — use them wisely!",
    side: 'top',
    route: '/for-you',
  },
  {
    id: 'profile-info',
    target: '[data-tour="profile-info"]',
    title: 'Your Profile',
    description:
      'This is your public profile card. Edit your name, avatar, and see your membership details.',
    side: 'bottom',
    route: '/profile',
  },
  {
    id: 'profile-genres',
    target: '[data-tour="profile-genres"]',
    title: 'Genre Preferences',
    description:
      'Select your favorite genres to personalize recommendations. The more you tell us, the better your suggestions become.',
    side: 'top',
    route: '/profile',
  },
  {
    id: 'profile-tabs',
    target: '[data-tour="profile-tabs"]',
    title: 'Activity & Reviews',
    description:
      'Switch between tabs to see your watchlist, watched movies, and reviews. All your cinema activity in one place.',
    side: 'top',
    route: '/profile',
  },
];

export const MOBILE_TOUR_STEPS = [
  {
    id: 'swipe-deck',
    target: '[data-tour="swipe-deck"]',
    title: 'Swipe to Discover',
    description:
      'Drag cards left, right, or up to react. Tap for details, swipe to react in bulk, or use the buttons below.',
    side: 'top',
    route: '/home',
  },
  {
    id: 'action-bar',
    target: '[data-tour="action-bar"]',
    title: 'React Your Way',
    description:
      'Love it, like it, skip it, or mark it watched. Each reaction teaches your AI to understand your taste.',
    side: 'top',
    route: '/home',
  },
  {
    id: 'foryou-hero',
    target: '[data-tour="foryou-hero"]',
    title: "Editor's Top Picks",
    description:
      'Hand-picked curated collections updated weekly by our film team. Browse the top 5 movies selected for you.',
    side: 'bottom',
    route: '/for-you',
  },
  {
    id: 'foryou-suggest',
    target: '[data-tour="foryou-suggest"]',
    title: 'AI Film Suggestions',
    description:
      "Tell us your mood and we'll pick the perfect film just for you. You get 3 suggestions per week — use them wisely!",
    side: 'top',
    route: '/for-you',
  },
  {
    id: 'profile-info',
    target: '[data-tour="profile-info"]',
    title: 'Your Profile',
    description:
      'This is your public profile card. Edit your name, avatar, and see your membership details.',
    side: 'bottom',
    route: '/profile',
  },
  {
    id: 'profile-genres',
    target: '[data-tour="profile-genres"]',
    title: 'Genre Preferences',
    description:
      'Select your favorite genres to personalize recommendations. The more you tell us, the better your suggestions become.',
    side: 'top',
    route: '/profile',
  },
];

const TOUR_COMPLETED_KEY = 'tour_completed';
const TOUR_STEP_KEY = 'tour_step';

export function TourProvider({ children }) {
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const saved = getCookie(TOUR_STEP_KEY);

    return saved && !isNaN(Number(saved)) ? Number(saved) : 0;
  });

  const steps = isMobile ? MOBILE_TOUR_STEPS : TOUR_STEPS;

  const safeCurrentStepIndex = Math.min(currentStepIndex, Math.max(steps.length - 1, 0));

  const currentStep = steps[safeCurrentStepIndex] ?? steps[0];

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };

    check();

    window.addEventListener('resize', check, {
      passive: true,
    });

    return () => {
      window.removeEventListener('resize', check);
    };
  }, []);

  const startTour = useCallback(() => {
    if (getCookie(TOUR_COMPLETED_KEY) === 'true') {
      return;
    }

    setIsActive(true);
    setShowFinish(false);
  }, []);

  const restartTour = useCallback(() => {
    setCookie(TOUR_COMPLETED_KEY, '', -1);
    setCookie(TOUR_STEP_KEY, '0', 30);

    setCurrentStepIndex(0);
    setShowFinish(false);
    setIsActive(true);
  }, []);

  const skipTour = useCallback(() => {
    setCookie(TOUR_COMPLETED_KEY, 'true', 365);
    setCookie(TOUR_STEP_KEY, '', -1);
    setCookie('needs_onboarding', '', -1);

    setIsActive(false);
    setShowFinish(false);

    router.push('/home');
  }, [router]);

  const stopTour = useCallback(
    (completed = false) => {
      if (completed) {
        setCookie(TOUR_COMPLETED_KEY, 'true', 365);
        setCookie(TOUR_STEP_KEY, '', -1);
      } else {
        setCookie(TOUR_STEP_KEY, String(safeCurrentStepIndex), 30);
      }

      setIsActive(false);
      setShowFinish(false);
    },
    [safeCurrentStepIndex]
  );

  const finishTour = useCallback(() => {
    setCookie(TOUR_COMPLETED_KEY, 'true', 365);
    setCookie(TOUR_STEP_KEY, '', -1);
    setCookie('needs_onboarding', '', -1);

    setShowFinish(false);
    setIsActive(false);

    router.push('/home');
  }, [router]);

  const goToStepRoute = useCallback(
    (idx) => {
      const step = steps[idx];

      if (step?.route) {
        router.push(step.route);
      }
    },
    [router, steps]
  );

  const nextStep = useCallback(() => {
    const nextIndex = safeCurrentStepIndex + 1;

    if (nextIndex < steps.length) {
      const cur = steps[safeCurrentStepIndex];
      const next = steps[nextIndex];

      setCookie(TOUR_STEP_KEY, String(nextIndex), 30);

      setCurrentStepIndex(nextIndex);

      if (cur.route !== next.route) {
        router.push(next.route);
      }
    } else {
      setIsActive(false);
      setShowFinish(true);
    }
  }, [safeCurrentStepIndex, steps, router]);

  const prevStep = useCallback(() => {
    if (safeCurrentStepIndex <= 0) {
      return;
    }

    const prevIndex = safeCurrentStepIndex - 1;

    const cur = steps[safeCurrentStepIndex];
    const prev = steps[prevIndex];

    setCookie(TOUR_STEP_KEY, String(prevIndex), 30);

    setCurrentStepIndex(prevIndex);

    if (cur.route !== prev.route) {
      router.push(prev.route);
    }
  }, [safeCurrentStepIndex, steps, router]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isActive && !showFinish) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          if (showFinish) {
            finishTour();
          } else {
            skipTour();
          }
          break;

        case 'ArrowRight':
        case 'Enter':
          if (!showFinish) {
            nextStep();
          }
          break;

        case 'ArrowLeft':
          if (!showFinish) {
            prevStep();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [isActive, showFinish, nextStep, prevStep, skipTour, finishTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        showFinish,
        currentStep,
        currentStepIndex: safeCurrentStepIndex,
        totalSteps: steps.length,
        startTour,
        restartTour,
        skipTour,
        stopTour,
        nextStep,
        prevStep,
        finishTour,
        goToStepRoute,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);

  if (!ctx) {
    throw new Error('useTour must be used within TourProvider');
  }

  return ctx;
}
