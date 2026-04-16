'use client';

import clsx from 'clsx';
import { Film, Sparkles, Heart, X } from 'lucide-react';
import Image from 'next/image';

import avatarImage from '@/assets/login/avatar-1.jpeg';
import avatarImage2 from '@/assets/login/avatar-2.jpeg';
import avatarImage3 from '@/assets/login/avatar-3.jpeg';
import backgroundImage from '@/assets/login/loginBackground.jpeg';
import cardImage from '@/assets/login/loginCard.jpeg';

import styles from './auth-layout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={`${styles.page} film-grain`}>
      <div className={styles.leftSection}>
        <div className={styles.bgImageWrap}>
          <Image
            src={backgroundImage}
            alt="Cinematic atmosphere"
            fill
            sizes="(max-width: 768px) 0vw, 55vw"
            priority
            className={styles.bgImage}
          />
          <div className={styles.gradientLeft} />
          <div className={styles.gradientBottom} />
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.cardMotion}>
            <div className={styles.bgCard1} />
            <div className={styles.bgCard2} />

            <div className={styles.mainCard}>
              <Image
                src={cardImage}
                alt="Movie Poster"
                fill
                sizes="(max-width: 768px) 80vw, 384px"
                className={styles.cardImage}
              />
              <div className={styles.cardGradient} />

              <div className={styles.cardInfo}>
                <div className={styles.aiTag}>
                  <Sparkles className={styles.sparkleIcon} />
                  <span className={clsx('text-micro', styles.aiTagText)}>AI Recommendation</span>
                </div>
                <h3 className={clsx('text-4xl', 'italic', styles.movieTitle)}>The Last Frame</h3>
                <p className={clsx('text-sm', styles.movieMeta)}>Drama · 2024 · 2h 15m</p>
              </div>

              <div className={styles.swipeLeft}>
                <div className={styles.swipeCircleLeft}>
                  <X className={styles.swipeIconX} />
                </div>
              </div>
              <div className={styles.swipeRight}>
                <div className={styles.swipeCircleRight}>
                  <Heart className={styles.swipeIconHeart} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quoteBlock}>
            <p className={clsx('text-2xl', 'italic', styles.quoteText)}>
              &ldquo;Swipe your way to your next favorite story.&rdquo;
            </p>
            <div className={styles.dots}>
              <div className={clsx(styles.dot, styles.dotActive)} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          </div>
        </div>

        <div className={styles.leftBranding}>
          <div className={styles.logoCircle}>
            <Film className={styles.logoIcon} />
          </div>
          <span className={clsx('text-2xl', styles.logoText)}>CineMatch</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Mobile-only header */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileLogoCircle}>
            <Film className={styles.mobileLogoIcon} />
          </div>
          <span className={clsx('text-2xl', styles.mobileLogoText)}>CineMatch</span>
        </header>

        <div className={styles.desktopSpacer} />

        <main className={styles.formMain}>{children}</main>

        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.avatarStack}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.avatarItem}>
                  <Image
                    src={i === 1 ? avatarImage : i === 2 ? avatarImage2 : avatarImage3}
                    alt="User avatar"
                    width={100}
                    height={100}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            <p className={clsx('text-micro', styles.footerUsers)}>
              Joined by <strong>12k+</strong> cinephiles
            </p>
          </div>
          <p className={clsx('text-micro', styles.footerCopy)}>
            &copy; 2026 CineMatch &bull; AI Discovery Engine
          </p>
        </footer>
      </div>
    </div>
  );
}
