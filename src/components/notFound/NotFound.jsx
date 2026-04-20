'use client';

import { Home, Compass } from 'lucide-react';
import Link from 'next/link';

import styles from './NotFound.module.css';

const SPROCKET_COUNT = 8;

export default function NotFoundComponent() {
  const holes = Array.from({ length: SPROCKET_COUNT }, (_, i) => i);

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.glowLeft} aria-hidden="true" />
      <div className={styles.glowRight} aria-hidden="true" />

      <div className={styles.filmFrame} role="main">
        {/* Top sprocket strip */}
        <div className={styles.sprocketStrip} aria-hidden="true">
          <div className={styles.sprocketHoles}>
            {holes.map((i) => (
              <div key={i} className={styles.sprocketHole} />
            ))}
          </div>
          <span className={styles.sprocketCode}>CINEMATCH · SCENE 404</span>
        </div>

        {/* Main film cell */}
        <div className={styles.filmCell}>
          {/* Animated reel */}
          <div className={styles.reelWrap} aria-hidden="true">
            <div className={styles.reelOuter}>
              <div className={styles.reelInner}>
                <div className={styles.reelHub} />
              </div>
            </div>
          </div>

          <h1 className={styles.errorCode}>
            4<span>0</span>4
          </h1>

          <span className={styles.sceneLabel}>
            <span className={styles.sceneLabelDot} />
            Scene not found
          </span>

          <p className={styles.title}>The reel is missing</p>

          <p className={styles.description}>
            This page has been cut from the edit. It may have moved, been renamed, or perhaps it
            never made it past production.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryBtn}>
              <Home size={14} aria-hidden="true" />
              Back to Home
            </Link>
            <Link href="/discover" className={styles.secondaryBtn}>
              <Compass size={14} aria-hidden="true" />
              Browse Films
            </Link>
          </div>

          <div className={styles.sceneFooter} aria-hidden="true">
            <div className={styles.sceneMetaItem}>
              <span className={styles.sceneMetaLabel}>Scene</span>
              <span className={styles.sceneMetaValue}>INT. VOID</span>
            </div>
            <div className={styles.sceneMetaDivider} />
            <div className={styles.sceneMetaItem}>
              <span className={styles.sceneMetaLabel}>Take</span>
              <span className={styles.sceneMetaValue}>#404</span>
            </div>
            <div className={styles.sceneMetaDivider} />
            <div className={styles.sceneMetaItem}>
              <span className={styles.sceneMetaLabel}>Status</span>
              <span className={styles.sceneMetaValue}>CUT</span>
            </div>
          </div>
        </div>

        {/* Bottom sprocket strip */}
        <div className={styles.sprocketStripBottom} aria-hidden="true">
          <div className={styles.sprocketHoles}>
            {holes.map((i) => (
              <div key={i} className={styles.sprocketHole} />
            ))}
          </div>
          <span className={styles.sprocketCode}>CINEMATCH · SCENE 404</span>
        </div>
      </div>
    </div>
  );
}
