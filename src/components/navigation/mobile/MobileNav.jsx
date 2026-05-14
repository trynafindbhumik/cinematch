'use client';

import clsx from 'clsx';
import { Home, Bookmark, Sparkles, User, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTour } from '@/context/TourContext';
import { setCookie } from '@/lib/cookie';

import styles from './MobileNavigation.module.css';

const MOBILE_NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/for-you', label: 'For You', icon: Sparkles },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { restartTour } = useTour();
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  const handleRestartTour = () => {
    setCookie('tour_completed', '', -1);
    setCookie('tour_step', '0', 30);
    restartTour();
  };

  return (
    <nav className={styles.mobileNav} aria-label="Mobile navigation">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(styles.mobileNavItem, active && styles.mobileNavItemActive)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={styles.mobileNavIcon} aria-hidden="true" />
            <span className={clsx('text-micro', styles.mobileNavLabel)}>{label}</span>
            {active && <span className={styles.mobileNavPip} aria-hidden="true" />}
          </Link>
        );
      })}
      <button
        type="button"
        className={styles.mobileNavItem}
        onClick={handleRestartTour}
        aria-label="Restart tour"
      >
        <HelpCircle className={styles.mobileNavIcon} aria-hidden="true" />
        <span className={clsx('text-micro', styles.mobileNavLabel)}>Tour</span>
      </button>
    </nav>
  );
}
