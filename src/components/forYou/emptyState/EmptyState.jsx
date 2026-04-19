'use client';

import { ChevronRight, Sparkles } from 'lucide-react';

import styles from './EmptyState.module.css';

const REEL_SPOKES = Array.from({ length: 8 }, (_, i) => ({
  id: `spoke-${i}`,
  angle: i * 45,
}));

export default function EmptyState({ exhausted, onSuggest }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyReel} aria-hidden="true">
        <div className={styles.emptyReelOuter}>
          {REEL_SPOKES.map((spoke) => (
            <div
              key={spoke.id}
              className={styles.emptyReelSpoke}
              style={{ transform: `rotate(${spoke.angle}deg)` }}
            />
          ))}
          <div className={styles.emptyReelInner} />
          <div className={styles.emptyReelHub} />
        </div>
      </div>

      {exhausted ? (
        <>
          <h3 className={styles.emptyTitle}>All Suggests Used</h3>
          <p className={styles.emptyText}>
            You&apos;ve used all 3 weekly suggests. Your quota resets every Monday — come back then
            for fresh picks.
          </p>
        </>
      ) : (
        <>
          <h3 className={styles.emptyTitle}>Ready When You Are</h3>
          <p className={styles.emptyText}>
            Hit the button and we&apos;ll match your taste profile to the perfect film from our
            catalogue.
          </p>
          <button type="button" className={styles.emptyBtn} onClick={onSuggest}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Suggest Me a Film</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
