'use client';

import { Heart, ThumbsUp, ThumbsDown, X, Eye, Skull } from 'lucide-react';
import React, { useState } from 'react';

import styles from './SwipeShowcase.module.css';
import { useScrollAnimation } from './useScrollAnimation';

const GESTURES = [
  {
    Icon: Heart,
    label: 'Love',
    sublabel: 'Instant watchlist add',
    fill: true,
    cssColor: 'var(--color-reaction-love)',
    bg: 'rgba(225, 29, 72, 0.09)',
    border: 'rgba(225, 29, 72, 0.25)',
  },
  {
    Icon: ThumbsUp,
    label: 'Like',
    sublabel: 'Refines your profile',
    fill: true,
    cssColor: 'var(--color-reaction-like)',
    bg: 'rgba(5, 150, 105, 0.09)',
    border: 'rgba(5, 150, 105, 0.25)',
  },
  {
    Icon: Eye,
    label: 'Watched',
    sublabel: 'Logs to collection',
    fill: false,
    cssColor: 'var(--color-reaction-watched)',
    bg: 'rgba(59, 130, 246, 0.09)',
    border: 'rgba(59, 130, 246, 0.25)',
  },
  {
    Icon: X,
    label: 'Skip',
    sublabel: 'Neutral pass',
    fill: false,
    cssColor: 'var(--color-accent)',
    bg: 'rgba(140, 120, 81, 0.09)',
    border: 'rgba(140, 120, 81, 0.3)',
  },
  {
    Icon: ThumbsDown,
    label: 'Dislike',
    sublabel: 'Fewer like this',
    fill: true,
    cssColor: 'var(--color-reaction-dislike)',
    bg: 'rgba(217, 119, 6, 0.09)',
    border: 'rgba(217, 119, 6, 0.25)',
  },
  {
    Icon: Skull,
    label: 'Hate',
    sublabel: 'Never show again',
    fill: false,
    cssColor: 'rgba(55, 65, 81, 0.8)',
    bg: 'rgba(55, 65, 81, 0.14)',
    border: 'rgba(55, 65, 81, 0.3)',
  },
];

export const SwipeShowcase = () => {
  const sectionRef = useScrollAnimation(0.1);
  const [activeIdx, setActiveIdx] = useState(null);

  return (
    <section id="swipe" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <span className={styles.eyebrow}>The Swipe Engine</span>
            <h2 className={styles.title}>
              Six Ways to <span className={styles.accent}>Feel</span> a Film
            </h2>
            <p className={styles.description}>
              Every gesture you make trains your Taste Profile with surgical precision. Our AI
              models your preferences across 2,000+ cinematic data points — from lighting palette to
              narrative arc.
            </p>

            <div className={styles.insightRow}>
              <div className={styles.insight}>
                <span className={styles.insightNum}>2,000+</span>
                <span className={styles.insightLabel}>Data points per film</span>
              </div>
              <div className={styles.insight}>
                <span className={styles.insightNum}>6</span>
                <span className={styles.insightLabel}>Distinct swipe signals</span>
              </div>
            </div>
          </div>

          <div className={styles.gestureGrid} role="group" aria-label="Swipe gesture types">
            {GESTURES.map(({ Icon, label, sublabel, fill, cssColor, bg, border }, i) => (
              <button
                key={label}
                className={`${styles.gesture} ${activeIdx === i ? styles.gestureActive : ''}`}
                style={{
                  '--g-color': cssColor,
                  '--g-bg': bg,
                  '--g-border': border,
                  '--delay': `${i * 0.07}s`,
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onFocus={() => setActiveIdx(i)}
                onBlur={() => setActiveIdx(null)}
                aria-label={`${label}: ${sublabel}`}
                type="button"
              >
                <div className={styles.gestureIcon}>
                  <Icon
                    size={28}
                    fill={fill && activeIdx === i ? cssColor : 'none'}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.gestureText}>
                  <span className={styles.gestureLabel}>{label}</span>
                  <span className={styles.gestureSub}>{sublabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
