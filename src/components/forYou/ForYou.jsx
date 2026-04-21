'use client';

import clsx from 'clsx';
import { Film, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import MovieCard from '@/components/elements/movieCard/MovieCard';
import EmptyState from '@/components/forYou/emptyState/EmptyState';
import FilmCountdownLoader from '@/components/forYou/filmCountdownLoader/Filmcountdownloader';
import ScanRefreshLoader from '@/components/forYou/scanRefreshLoader/ScanRefreshLoader';
import { MOCK_MOVIES } from '@/mocks/data';

import styles from './ForYou.module.css';

const WEEKLY_TRIES = 3;
const TOP_PICKS = MOCK_MOVIES.slice(0, 5);
const TRIES_KEYS = ['t1', 't2', 't3'];

export default function ForYouComponent() {
  const [triesLeft, setTriesLeft] = useState(WEEKLY_TRIES);

  const [isLoading, setIsLoading] = useState(false);
  const [loaderLineIdx, setLoaderLineIdx] = useState(0);
  const [loaderTick, setLoaderTick] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const timeoutRefs = useRef([]);
  const lineRef = useRef(null);

  useEffect(
    () => () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    },
    []
  );

  const pickMovies = () => {
    const pool = [...MOCK_MOVIES].sort(() => Math.random() - 0.5);
    return pool.slice(0, 4);
  };

  const handleSuggest = () => {
    if (triesLeft <= 0 || isLoading || isRefreshing) return;

    const isFirstSuggest = suggestions.length === 0;

    if (isFirstSuggest) {
      setIsLoading(true);
      setRevealed(false);
      setLoaderTick(0);
      setLoaderLineIdx(0);

      let lineIdx = 0;
      lineRef.current = setInterval(() => {
        lineIdx = (lineIdx + 1) % 5;
        setLoaderLineIdx(lineIdx);
      }, 700);

      const t1 = setTimeout(() => setLoaderTick(1), 900);
      const t2 = setTimeout(() => setLoaderTick(2), 1800);
      const t3 = setTimeout(() => {
        clearInterval(lineRef.current);
        setSuggestions(pickMovies());
        setIsLoading(false);
        setTriesLeft((t) => t - 1);
        setTimeout(() => setRevealed(true), 60);
      }, 2800);

      timeoutRefs.current = [t1, t2, t3];
    } else {
      setIsRefreshing(true);
      setRevealed(false);

      const t4 = setTimeout(() => {
        setSuggestions(pickMovies());
        setIsRefreshing(false);
        setTriesLeft((t) => t - 1);
        setTimeout(() => setRevealed(true), 60);
      }, 1500);

      timeoutRefs.current = [t4];
    }
  };

  const exhausted = triesLeft <= 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroLabel}>
          <span className={styles.heroDot} />
          <span className={clsx(styles.heroEyebrow, 'text-micro')}>Editor&apos;s Selection</span>
        </div>

        <div className={styles.heroHeadingRow}>
          <h1 className={clsx(styles.heroHeading, 'h-4xl')}>
            Top 5 Picks
            <br />
            <em>This Week</em>
          </h1>
          <p className={styles.heroSubtext}>
            Curated by our film algorithm,
            <br className={styles.mobileBreak} />
            refreshed every Monday.
          </p>
        </div>

        <div className={styles.heroCards}>
          {TOP_PICKS.map((movie, i) => (
            <div key={movie.id} className={styles.heroCardWrap} style={{ '--i': i }}>
              <span className={clsx(styles.rankBadge, 'text-micro')}>#{i + 1}</span>
              <MovieCard movie={movie} showActions={false} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.suggestSection}>
        <div className={styles.suggestHeader}>
          <div className={styles.suggestHeaderLeft}>
            <span className={clsx(styles.suggestEyebrow, 'text-micro')}>
              <Sparkles size={11} aria-hidden="true" />
              AI-Powered
            </span>
            <h2 className={clsx(styles.suggestTitle, 'h-3xl')}>Suggest Me a Film</h2>
            <p className={styles.suggestSubtitle}>
              We&apos;ll pick the perfect film based on your taste profile.
            </p>
          </div>

          <div className={styles.triesPill} aria-label={`${triesLeft} suggests remaining`}>
            <div className={styles.triesDots} aria-hidden="true">
              {TRIES_KEYS.map((key, i) => (
                <span
                  key={key}
                  className={clsx(
                    styles.triesDot,
                    i < triesLeft ? styles.triesDotFull : styles.triesDotEmpty
                  )}
                />
              ))}
            </div>
            <span className={clsx(styles.triesLabel, 'text-micro')}>
              {exhausted
                ? 'Resets Monday'
                : `${triesLeft} suggest${triesLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>

        <div className={styles.suggestBody}>
          {isLoading && (
            <div className={styles.loaderWrap}>
              <FilmCountdownLoader tick={loaderTick} lineIndex={loaderLineIdx} />
            </div>
          )}

          {!isLoading && hasSuggestions && (
            <div
              className={clsx(
                styles.resultsWrap,
                (revealed || isRefreshing) && styles.resultsRevealed
              )}
            >
              <div className={styles.resultsMeta}>
                <Film size={13} aria-hidden="true" />
                <span className="text-micro">Your picks are ready</span>
              </div>

              <div className={styles.resultsGridWrap}>
                {isRefreshing && <ScanRefreshLoader />}

                <div
                  className={clsx(styles.resultsGrid, isRefreshing && styles.resultsGridRefreshing)}
                >
                  {suggestions.map((movie, i) => (
                    <div
                      key={movie.id}
                      className={styles.resultCardWrap}
                      style={{ '--delay': `${i * 0.1}s` }}
                    >
                      <MovieCard movie={movie} showActions />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !hasSuggestions && (
            <EmptyState exhausted={exhausted} onSuggest={handleSuggest} />
          )}

          {!isLoading && !exhausted && (
            <div className={styles.suggestBtnRow}>
              <button
                type="button"
                className={styles.suggestBtn}
                onClick={handleSuggest}
                disabled={isRefreshing}
                aria-label={hasSuggestions ? 'Suggest again' : 'Suggest me a film'}
              >
                {hasSuggestions ? (
                  <>
                    <RefreshCw size={16} aria-hidden="true" />
                    <span>Suggest Again</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} aria-hidden="true" />
                    <span>Suggest Me</span>
                  </>
                )}
              </button>

              {!hasSuggestions && (
                <p className={styles.suggestBtnHint}>
                  Uses 1 of {triesLeft} remaining suggest{triesLeft !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {exhausted && hasSuggestions && (
            <p className={styles.exhaustedNote}>
              You&apos;ve used all your suggests for this week. Come back Monday for more.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
