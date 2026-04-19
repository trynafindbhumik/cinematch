'use client';

import { Clapperboard } from 'lucide-react';

import styles from './FilmCountdownLoader.module.css';

const LOADER_LINES = [
  'Scanning your taste profile…',
  'Consulting 10,000 cinephiles…',
  'Matching mood to masterpiece…',
  'Cross-referencing your genres…',
  'Finalising your picks…',
];

const FILM_HOLES_TOP = Array.from({ length: 20 }, (_, i) => `film-top-${i}`);
const FILM_HOLES_BOTTOM = Array.from({ length: 20 }, (_, i) => `film-bottom-${i}`);
const COUNTS = ['3', '2', '1'];

export default function FilmCountdownLoader({ tick, lineIndex }) {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderFilmStrip}>
        {FILM_HOLES_TOP.map((key) => (
          <span key={key} className={styles.loaderFilmHole} />
        ))}
      </div>

      <div className={styles.loaderInner}>
        <div className={styles.loaderFrame}>
          <div className={styles.loaderFrameCorner} data-pos="tl" />
          <div className={styles.loaderFrameCorner} data-pos="tr" />
          <div className={styles.loaderFrameCorner} data-pos="bl" />
          <div className={styles.loaderFrameCorner} data-pos="br" />

          <span key={tick} className={styles.loaderCount}>
            {COUNTS[tick]}
          </span>

          <div className={styles.loaderReel}>
            <Clapperboard size={18} />
          </div>
        </div>

        <div className={styles.loaderBeam} />

        <p key={lineIndex} className={styles.loaderLine}>
          {LOADER_LINES[lineIndex]}
        </p>
      </div>

      <div className={styles.loaderFilmStrip}>
        {FILM_HOLES_BOTTOM.map((key) => (
          <span key={key} className={styles.loaderFilmHole} />
        ))}
      </div>
    </div>
  );
}
