import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import avatar1 from '@/assets/home/avatar/avatar1.jpeg';
import avatar2 from '@/assets/home/avatar/avatar2.jpeg';
import avatar3 from '@/assets/home/avatar/avatar3.jpeg';
import avatar4 from '@/assets/home/avatar/avatar4.jpeg';
import avatar5 from '@/assets/home/avatar/avatar5.jpeg';

import styles from './CTA.module.css';

const AVATARS = [
  { id: 'avatar1', src: avatar1 },
  { id: 'avatar2', src: avatar2 },
  { id: 'avatar3', src: avatar3 },
  { id: 'avatar4', src: avatar4 },
  { id: 'avatar5', src: avatar5 },
];

export const CTA = () => {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.container}>
        <span className={styles.eyebrow}>Join the Revolution</span>

        <h2 id="cta-heading" className={styles.title}>
          Ready for Your
          <br />
          <span className={styles.accent}>Next Obsession?</span>
        </h2>

        <p className={styles.description}>
          Join 50,000+ cinephiles discovering their perfect match every day. No credit card
          required.
        </p>

        <div className={styles.actions}>
          <Link href="/signup" className={styles.primaryBtn}>
            Create Free Account
          </Link>
          <Link href="/login" className={styles.outlineBtn}>
            Sign In
          </Link>
        </div>

        <div className={styles.proof} aria-label="Trusted by cinephiles worldwide">
          <div className={styles.avatars} aria-hidden="true">
            {AVATARS.map(({ id, src }) => (
              <Image
                key={id}
                src={src}
                alt=""
                width={40}
                height={40}
                className={styles.avatar}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <p className={styles.proofText}>
            Loved by <strong>50,000+</strong> cinephiles worldwide
          </p>
        </div>
      </div>
    </section>
  );
};
