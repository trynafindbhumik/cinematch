'use client';

import clsx from 'clsx';

import WatchedComponent from '@/components/watched/Watched';

import styles from './Watched.module.css';

export default function WatchedTab() {
  return (
    <div className={styles.tabWrap}>
      <p className={clsx(styles.tabSubtitle, 'italic')}>Films you&apos;ve already seen.</p>
      <WatchedComponent />
    </div>
  );
}
