'use client';

import clsx from 'clsx';
import {
  Film,
  ChevronRight,
  LogOut,
  Home,
  Bookmark,
  Eye,
  User,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useSidebar } from '@/context/SidebarContext';
import { removeCookie } from '@/utils/cookie';

import styles from './SideBar.module.css';

const NAV_GROUPS = [
  {
    section: 'Discover',
    items: [
      { href: '/home', label: 'Home', icon: Home },
      { href: '/for-you', label: 'For You', icon: Sparkles },
      { href: '/search', label: 'Search', icon: Search },
    ],
  },
  {
    section: 'My Cinema',
    items: [
      { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
      { href: '/watched', label: 'Watched', icon: Eye },
    ],
  },
];

export default function Sidebar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    removeCookie('auth_token');
    removeCookie('user_session');
    router.push('/');
  };

  if (isCollapsed === null) {
    return <div className={styles.sidebarSkeleton} aria-hidden="true" />;
  }

  return (
    <aside
      className={clsx(styles.sidebar, isCollapsed && styles.sidebarCollapsed)}
      aria-label="Application sidebar"
    >
      {/* ── Brand ── */}
      <div className={styles.brand}>
        <div className={styles.logoMark} aria-hidden="true">
          <Film className={styles.logoIcon} />
        </div>

        {!isCollapsed && <span className={clsx('text-2xl', styles.logoText)}>CineMatch</span>}

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-nav"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={15} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={15} aria-hidden="true" />
          )}
        </button>
      </div>

      <nav id="sidebar-nav" className={styles.nav} aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div
            key={group.section}
            className={styles.navGroup}
            role="group"
            aria-label={group.section}
          >
            {!isCollapsed && (
              <span className={clsx('text-sm', styles.sectionLabel)} aria-hidden="true">
                {group.section}
              </span>
            )}

            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.navLink, active && styles.navLinkActive)}
                  aria-current={active ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={styles.navIcon} aria-hidden="true" />
                  {!isCollapsed && (
                    <span className={clsx('text-sm', styles.navLabel)}>{item.label}</span>
                  )}
                  {active && isCollapsed && (
                    <span className={styles.activePip} aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link
          href="/profile"
          className={clsx(styles.profileCard, isActive('/profile') && styles.profileCardActive)}
          title={isCollapsed ? (profile?.name ?? 'My Profile') : undefined}
          aria-label={isCollapsed ? (profile?.name ?? 'My Profile') : undefined}
        >
          <div className={styles.avatarWrap}>
            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name ?? 'Profile photo'}
                referrerPolicy="no-referrer"
                width={32}
                height={32}
              />
            ) : (
              <User size={14} aria-hidden="true" />
            )}
          </div>

          {!isCollapsed && (
            <>
              <div className={styles.profileInfo}>
                <p className={clsx('text-sm', styles.profileName)}>
                  {profile?.name ?? 'My Account'}
                </p>
                <p className={clsx('text-micro', styles.profileEmail)}>{profile?.email ?? ''}</p>
              </div>
              <ChevronRight className={styles.profileChevron} aria-hidden="true" />
            </>
          )}
        </Link>

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="Logout"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={styles.logoutIcon} aria-hidden="true" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
