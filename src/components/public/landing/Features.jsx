'use client';

import { Brain, Layers, Star, Laptop, Clock, Share2 } from 'lucide-react';
import React from 'react';

import styles from './Features.module.css';
import { useScrollAnimation } from './useScrollAnimation';

const FEATURES = [
  {
    Icon: Brain,
    title: 'AI Pulse',
    description:
      'Neural network analysis across 2,000+ data points per film — from lighting quality to emotional arc and narrative weight.',
  },
  {
    Icon: Layers,
    title: 'Mood-Based Feed',
    description:
      'A home screen that evolves with your mood. Your personal cinema concierge, always in tune.',
  },
  {
    Icon: Star,
    title: 'Deep Insights',
    description:
      'Beyond star ratings — detailed cast analysis, genre evolution timelines, and curated critical context.',
  },
  {
    Icon: Laptop,
    title: 'OTT Integration',
    description:
      'Filter recommendations across 22+ streaming platforms you actually subscribe to. Netflix, Prime, Hotstar, and more.',
  },
  {
    Icon: Clock,
    title: 'Smart Watchlist',
    description:
      'Never lose a film. AI resurfaces saved titles the moment they match your current vibe.',
  },
  {
    Icon: Share2,
    title: 'Social Reactions',
    description:
      'Join the global cinephile conversation. Interactive reviews, reactions, and ratings — all in one place.',
  },
];

export const Features = () => {
  const sectionRef = useScrollAnimation(0.08);

  return (
    <section id="features" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Core Technology</span>
          <h2 className={styles.title}>
            Engineered for <span className={styles.accent}>Discovery</span>
          </h2>
          <p className={styles.subtitle}>
            We have deconstructed the cinematic experience into over 2,000 unique data points so you
            never have to guess again.
          </p>
        </header>

        <div className={styles.grid}>
          {FEATURES.map(({ Icon, title, description }, i) => (
            <article key={title} className={styles.card} style={{ '--delay': `${i * 0.09}s` }}>
              <div className={styles.iconWrapper}>
                <Icon size={26} aria-hidden="true" />
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
