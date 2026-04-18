'use client';

import clsx from 'clsx';

import Watchlist from '@/components/watchlist/Watchlist';

import styles from './Watchlist.module.css';

export default function WatchlistTab() {
  return (
    <div className={styles.tabWrap}>
      <p className={clsx(styles.tabSubtitle, 'italic')}>Movies you&apos;re planning to see.</p>
      <Watchlist />
    </div>
  );
}
