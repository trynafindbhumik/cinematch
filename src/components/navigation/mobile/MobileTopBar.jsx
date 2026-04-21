'use client';

import clsx from 'clsx';
import { Film, LogOut, Search } from 'lucide-react';
import Link from 'next/link';

import styles from './MobileNavigation.module.css';

export default function MobileTopBar() {
  const handleLogout = () => {
    document.cookie.split(';').forEach((c) => {
      const name = c.indexOf('=') > -1 ? c.substr(0, c.indexOf('=')).trim() : c.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    window.location.href = '/';
  };

  return (
    <header className={styles.mobileTopBar}>
      <div className={styles.mobileTopBarLeft}>
        <div className={styles.mobileLogoMark} aria-hidden="true">
          <Film size={16} />
        </div>
        <span className={clsx('text-2xl', styles.mobileLogoText)}>CineMatch</span>
      </div>
      <div className={styles.mobileTopBarRight}>
        <Link href="/search" className={styles.mobileSearchBtn} aria-label="Search movies">
          <Search size={18} aria-hidden="true" />
        </Link>
        <button
          type="button"
          className={styles.mobileLogoutBtn}
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
