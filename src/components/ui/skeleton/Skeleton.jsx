'use client';

import clsx from 'clsx';

import styles from './Skeleton.module.css';

/**
 * Skeleton loading component with various shape variants
 *
 * Props:
 *  - variant : 'text' | 'circular' | 'rectangular' | 'card' - shape of the skeleton
 *  - width   : number | string - width of the skeleton
 *  - height  : number | string - height of the skeleton
 *  - className: string - additional class for the skeleton
 *  - animate : boolean - enable/disable shimmer animation (default: true)
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animate = true,
  style,
  ...props
}) {
  return (
    <div
      className={clsx(styles.skeleton, styles[variant], animate && styles.animate, className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Skeleton group for loading multiple items
 */
export function SkeletonGroup({ children, className, ...props }) {
  return (
    <div className={clsx(styles.group, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Profile card skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className={styles.profileSkeleton}>
      <div className={styles.avatarRow}>
        <Skeleton variant="circular" width={88} height={88} />
        <div className={styles.metaColumn}>
          <Skeleton width="60%" height={32} />
          <Skeleton width="40%" height={18} style={{ marginTop: 8 }} />
          <div className={styles.badgeRow}>
            <Skeleton variant="rectangular" width={100} height={24} />
            <Skeleton variant="rectangular" width={120} height={24} />
          </div>
        </div>
      </div>
      <div className={styles.settingsGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Skeleton width={120} height={14} />
            <Skeleton width={60} height={14} />
          </div>
          <div className={styles.chipsRow}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" width={70} height={28} />
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Skeleton width={140} height={14} />
            <Skeleton variant="rectangular" width={60} height={24} />
          </div>
          <div className={styles.chipsRow}>
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" width={80} height={32} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Genre chips skeleton
 */
export function GenreChipsSkeleton({ count = 6 }) {
  return (
    <div className={styles.chipsRow}>
      {Array.from({ length: count }).map((_, i) => {
        const skeletonKey = `genre-skeleton-${count}-${70 + (i % 3) * 15}-${i}`;

        return (
          <Skeleton key={skeletonKey} variant="rectangular" width={70 + (i % 3) * 15} height={28} />
        );
      })}
    </div>
  );
}

/**
 * Streaming chips skeleton
 */
export function StreamingChipsSkeleton({ count = 3 }) {
  return (
    <div className={styles.chipsRow}>
      {Array.from({ length: count }).map((_, i) => {
        const skeletonKey = `streaming-skeleton-${count}-${90 + (i % 3) * 20}-${i}`;

        return (
          <Skeleton key={skeletonKey} variant="rectangular" width={90 + (i % 3) * 20} height={32} />
        );
      })}
    </div>
  );
}

/**
 * Action card skeleton
 */
export function ActionCardSkeleton() {
  return (
    <div className={styles.actionCard}>
      <div className={styles.actionCardInfo}>
        <Skeleton variant="circular" width={44} height={44} />
        <div className={styles.actionCardText}>
          <Skeleton width={150} height={16} />
          <Skeleton width={200} height={12} style={{ marginTop: 4 }} />
        </div>
      </div>
      <Skeleton variant="rectangular" width={140} height={40} />
    </div>
  );
}
