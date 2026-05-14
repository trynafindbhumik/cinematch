'use client';

import { useEffect } from 'react';

import { useTour } from '@/context/TourContext';
import { getCookie } from '@/lib/cookie';

export default function TourTrigger() {
  const { startTour, isActive } = useTour();

  useEffect(() => {
    if (isActive) return;
    const needsOnboarding = getCookie('needs_onboarding');
    if (needsOnboarding === 'true') {
      startTour();
    }
  }, [startTour, isActive]);

  return null;
}
