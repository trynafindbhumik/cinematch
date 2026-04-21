import React from 'react';

import { Footer } from '@/components/public/footer/Footer';

import { CTA } from './CTA';
import { Features } from './Features';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import styles from './Landing.module.css';
import { Navbar } from './Navbar';
import { SwipeShowcase } from './SwipeShowcase';

export const LandingPage = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grain} aria-hidden="true" />

      <Navbar />

      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Features />
        <SwipeShowcase />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};
