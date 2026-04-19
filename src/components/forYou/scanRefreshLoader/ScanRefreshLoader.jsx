'use client';

import styles from './ScanRefreshLoader.module.css';

export default function ScanRefreshLoader() {
  return (
    <div className={styles.overlay} aria-label="Recalibrating picks…" role="status">
      <div className={styles.filmStrip}>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={`hole-${i}`} className={styles.filmHole} />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.scanBeam} />

        <div className={styles.textGroup}>
          <span className={styles.label}>Recalibrating</span>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>

      {/* Film strip bottom */}
      <div className={styles.filmStrip}>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={`hole-b-${i}`} className={styles.filmHole} />
        ))}
      </div>
    </div>
  );
}
