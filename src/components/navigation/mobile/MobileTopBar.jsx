'use client';

import clsx from 'clsx';
import { Film, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useLogout } from '@/hooks/useLogout';

import styles from './MobileNavigation.module.css';

export default function MobileTopBar() {
  const router = useRouter();
  const [, logout] = useLogout();

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
