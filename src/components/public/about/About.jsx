'use client';

import { Heart, Compass, Users, Zap, Shield, Film } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import aboutbanner from '@/assets/about/about-banner.jpg';
import aboutbanner1 from '@/assets/about/about-banner2.jpg';

import styles from './About.module.css';

const TIMELINE = [
  {
    year: '2024',
    title: 'The Idea',
    desc: 'Frustrated with endless scrolling on streaming platforms, our founders sketch the first version of CineMatch on a napkin at a Mumbai film festival.',
  },
  {
    year: '2025',
    title: 'First Lines of Code',
    desc: 'A team of three ships the beta product. 500 early adopters generate over 80,000 swipes in the first week.',
  },
  {
    year: '2025',
    title: 'Seed Round',
    desc: 'We raise $2.4M to expand the team and build the AI taste engine, onboarding talent from Google, Netflix, and Criterion.',
  },
  {
    year: '2026',
    title: 'Going Public',
    desc: 'CineMatch opens to the world with 22 streaming integrations, a 2,000+ data-point AI engine, and 50,000 passionate cinephiles.',
  },
];

const VALUES = [
  {
    number: '01',
    Icon: Heart,
    title: 'Curator over aggregator',
    desc: "We don't list every film ever made. We curate experiences we believe will genuinely resonate with each viewer's unique cinematic sensibility.",
  },
  {
    number: '02',
    Icon: Shield,
    title: 'Privacy by default',
    desc: 'Your viewing data belongs to you. We are fully transparent about what we collect, why we collect it, and how you can take it with you.',
  },
  {
    number: '03',
    Icon: Compass,
    title: 'Discovery over comfort',
    desc: 'Great recommendations push boundaries. We introduce you to films you would never have found scrolling alone — across genres, eras, and continents.',
  },
  {
    number: '04',
    Icon: Users,
    title: 'Community, not crowd',
    desc: "CineMatch is built by cinephiles, for cinephiles. Every feature starts with a real person's frustration with how movies are discovered today.",
  },
  {
    number: '05',
    Icon: Zap,
    title: 'Speed as respect',
    desc: 'A fast interface is a respectful one. We optimise relentlessly so your next film is one swipe away, never three loading screens.',
  },
  {
    number: '06',
    Icon: Film,
    title: 'Cinema as culture',
    desc: 'Film is the most powerful storytelling medium humans have ever invented. We treat it with the reverence it deserves.',
  },
];

export default function AboutComponent() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero} aria-label="About CineMatch">
        <div className={styles.heroBg} aria-hidden="true">
          <Image
            src={aboutbanner}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            priority
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Our Story</span>
          <h1 className={styles.heroTitle}>
            Built by People
            <br />
            Who Love <em>Cinema</em>
          </h1>
          <p className={styles.heroQuote}>
            &quot;Discovery should feel as cinematic as the films themselves.&quot;
          </p>
          <div className={styles.heroStats} aria-label="Key statistics">
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>2026</span>
              <span className={styles.heroStatLabel}>Founded</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>12</span>
              <span className={styles.heroStatLabel}>Team Members</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>50K+</span>
              <span className={styles.heroStatLabel}>Cinephiles</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>22+</span>
              <span className={styles.heroStatLabel}>OTT Platforms</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storySectionInner}>
          <div className={styles.storyLeft}>
            <span className={styles.sectionLabel}>Who We Are</span>
            <h2 className={styles.storyHeading}>
              Rethinking how
              <br />
              the world
              <br />
              <em>finds films</em>
            </h2>
            <div className={styles.storyImageWrap}>
              <Image
                src={aboutbanner1}
                alt="The CineMatch team"
                width={800}
                height={600}
                priority
              />
            </div>
          </div>

          <div className={styles.storyRight}>
            <p className={styles.storyText}>
              CineMatch was born out of a simple, recurring frustration:{' '}
              <strong>great films exist everywhere, but finding them feels impossible.</strong>{' '}
              Streaming platforms are built to keep you watching anything, not the right thing. The
              algorithm optimises for engagement, not taste.
            </p>
            <p className={styles.storyText}>
              We started with a question: what if discovery felt as good as watching? What if
              finding your next favourite film was itself a cinematic experience?
            </p>
            <p className={styles.storyText}>
              CineMatch is our answer. A platform that learns your taste, respects your time, and
              finally puts great cinema within reach.
            </p>
            <blockquote className={styles.storyPullQuote}>
              &ldquo;Every film you love is a relationship waiting to happen.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      <section className={styles.valuesSection} aria-labelledby="values-heading">
        <div className={styles.valuesInner}>
          <div className={styles.valuesHeader}>
            <span className={styles.sectionLabel}>Six Principles We Never Compromise</span>
            <h2 id="values-heading" className={styles.valuesTitle}>
              What We <em>Stand For</em>
            </h2>
          </div>

          <div className={styles.valuesGrid}>
            {VALUES.map(({ number, Icon, title, desc }) => (
              <article key={number} className={styles.valueCard}>
                <div className={styles.valueNumberWrap}>
                  <span className={styles.valueNumber}>{number}</span>
                </div>
                <div className={styles.valueIconWrap}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className={styles.valueTitle}>{title}</h3>
                <p className={styles.valueDesc}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.timelineSection} aria-labelledby="timeline-heading">
        <div className={styles.timelineInner}>
          <div className={styles.timelineHeader}>
            <span className={styles.sectionLabel}>Our Journey</span>
            <h2 id="timeline-heading" className={styles.timelineHeading}>
              From Napkin to <em>50,000 Cinephiles</em>
            </h2>
          </div>

          <div className={styles.timelineGrid}>
            {TIMELINE.map(({ year, title, desc }) => (
              <div key={`${year}-${title}`} className={styles.timelineItem}>
                <span className={styles.timelineYear}>{year}</span>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineTitle}>{title}</h3>
                  <p className={styles.timelineDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
