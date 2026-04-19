'use client';

import clsx from 'clsx';
import { Home, Bookmark, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './MobileNavigation.module.css';

const MOBILE_NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/for-you', label: 'For You', icon: Sparkles },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

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
    </nav>
  );
}
