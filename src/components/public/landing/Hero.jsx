'use client';

import { Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import cinema1 from '@/assets/home/cinema1.jpg';
import cinema2 from '@/assets/home/cinema2.jpg';
import cinema3 from '@/assets/home/cinema3.jpg';

import styles from './Hero.module.css';

const CARD_IMAGES = [
  { id: 'cinema1', src: cinema1 },
  { id: 'cinema2', src: cinema2 },
  { id: 'cinema3', src: cinema3 },
];

const STATS = [
  { value: '5M+', label: 'Swipes Today' },
  { value: '98%', label: 'Match Rate' },
  { value: '50K+', label: 'Cinephiles' },
];

export const Hero = () => {
  return (
    <section className={styles.hero} aria-label="CineMatch hero">
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.glowLeft} aria-hidden="true" />
      <div className={styles.glowRight} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge} aria-label="AI-Powered Discovery">
            <Sparkles size={13} className={styles.badgeIcon} aria-hidden="true" />
            <span>AI-Powered Discovery</span>
          </div>

          <h1 className={styles.title}>
            Swipe Your Way
            <br />
            to Your Next
            <br />
            <span className={styles.accent}>Favorite</span> Story
          </h1>

          <p className={styles.description}>
            CineMatch replaces endless scrolling with cinematic instinct. Discover films through a
            swipe-based interface that learns your taste with every choice.
          </p>

          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryBtn}>
              Start Swiping
              <Play size={15} fill="currentColor" aria-hidden="true" />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={styles.ghostBtn}
            >
              How It Works
            </button>
          </div>

          <div className={styles.stats} aria-label="Key statistics">
            {STATS.map(({ value, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className={styles.statDivider} aria-hidden="true" />}
                <div className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.cardStack}>
            {CARD_IMAGES.map(({ id, src }, i) => (
              <div key={id} className={`${styles.card} ${styles[`card${i + 1}`]}`}>
                <Image
                  src={src}
                  alt=""
                  width={400}
                  height={600}
                  priority
                  loading="eager"
                  decoding="async"
                />

                {i === 0 && (
                  <div className={styles.cardOverlay}>
                    <div className={styles.cardInfo}>
                      <h3>Cinematic Vision</h3>
                      <p>Drama · Sci-Fi · 2025</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className={styles.swipeHint}>
              <span className={styles.swipeLeft}>✕ Skip</span>
              <span className={styles.swipeRight}>♥ Love</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollText}>Explore</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
};
