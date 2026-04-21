'use client';

import { Search, Zap, Eye, Heart, ThumbsUp, SkipForward } from 'lucide-react';
import React from 'react';

import styles from './HowItWorks.module.css';
import { useScrollAnimation } from './useScrollAnimation';

const STEPS = [
  {
    number: '01',
    Icon: Search,
    title: 'Discover',
    description:
      'Our AI scouts thousands of films across every genre and platform, surfacing hidden gems tailored to your unique taste profile.',
  },
  {
    number: '02',
    Icon: Zap,
    title: 'Swipe',
    description:
      'Love, Like, or Skip — each gesture sharpens your Taste Profile in real-time. Six distinct signals. Zero decision fatigue.',
  },
  {
    number: '03',
    Icon: Eye,
    title: 'Enjoy',
    description:
      'Skip the scroll. Get straight to the stories that matter. Filtered to the streaming platforms you already own.',
  },
];

const GESTURE_CHIPS = [
  {
    Icon: Heart,
    label: 'Love',
    color: 'var(--color-reaction-love)',
    bg: 'rgba(225, 29, 72, 0.08)',
    bgHover: 'rgba(225, 29, 72, 0.14)',
  },
  {
    Icon: ThumbsUp,
    label: 'Like',
    color: 'var(--color-reaction-like)',
    bg: 'rgba(5, 150, 105, 0.08)',
    bgHover: 'rgba(5, 150, 105, 0.14)',
  },
  {
    Icon: SkipForward,
    label: 'Skip',
    color: 'var(--color-ink-40)',
    bg: 'var(--color-ink-05)',
    bgHover: 'var(--color-ink-10)',
  },
];

export const HowItWorks = () => {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section id="how-it-works" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Discovery Reimagined</span>
          <h2 className={styles.title}>How CineMatch Works</h2>
          <p className={styles.subtitle}>
            Finding a great film should feel as good as watching one.
          </p>
        </header>

        <div className={styles.grid}>
          {STEPS.map(({ number, Icon, title, description }, i) => (
            <article key={number} className={styles.step} style={{ '--delay': `${i * 0.14}s` }}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {number}
                </span>
                <div className={styles.iconWrapper}>
                  <Icon size={26} aria-hidden="true" />
                </div>
              </div>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepDesc}>{description}</p>
            </article>
          ))}
        </div>

        <div className={styles.showcase}>
          <div className={styles.showcaseText}>
            <h3 className={styles.showcaseTitle}>The Art of the Swipe</h3>
            <p className={styles.showcaseDesc}>Every gesture tells a story about your taste.</p>
          </div>

          <div className={styles.gestures} aria-label="Swipe gesture types">
            {GESTURE_CHIPS.map(({ Icon, label, color, bg, bgHover }) => (
              <div
                key={label}
                className={styles.gestureChip}
                style={{
                  '--chip-color': color,
                  '--chip-bg': bg,
                  '--chip-bg-hover': bgHover,
                }}
              >
                <div className={styles.gestureIconWrap}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <span className={styles.gestureLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
