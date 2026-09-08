'use client';

import clsx from 'clsx';
import { RefreshCw, Sparkles, AlertCircle, Flame, Compass } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import MovieCard from '@/components/elements/movieCard/MovieCard';
import ScanRefreshLoader from '@/components/forYou/scanRefreshLoader/ScanRefreshLoader';
import { MovieCardSkeleton } from '@/components/ui/skeleton/Skeleton';
import { useTour } from '@/context/TourContext';
import { useWeeklySuggestions } from '@/hooks/useWeeklySuggestions';

import styles from './ForYou.module.css';

const TOUR_FORYOU_PICKS = [
  {
    tmdb_id: 550,
    title: 'Fight Club',
    poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    tmdb_rating: 84,
    release_year: 1999,
    genres: ['Drama', 'Thriller'],
    match_reason: 'Matches your preference for psychological thrillers',
  },
  {
    tmdb_id: 157336,
    title: 'Interstellar',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    tmdb_rating: 86,
    release_year: 2014,
    genres: ['Sci-Fi', 'Drama'],
    match_reason: 'High affinity for Christopher Nolan epics',
  },
  {
    tmdb_id: 27205,
    title: 'Inception',
    poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEW9W2vBBGLB2JSXA3iMoVpq.jpg',
    tmdb_rating: 83,
    release_year: 2010,
    genres: ['Action', 'Sci-Fi'],
    match_reason: 'Recommended based on mind-bending plot preferences',
  },
  {
    tmdb_id: 278,
    title: 'The Shawshank Redemption',
    poster_url: 'https://image.tmdb.org/t/p/w500/9cqN1wXHQyBhGvdUtPSpwUtOfXB.jpg',
    tmdb_rating: 87,
    release_year: 1994,
    genres: ['Drama', 'Crime'],
    match_reason: 'Top rated masterpiece curated for film lovers',
  },
  {
    tmdb_id: 680,
    title: 'Pulp Fiction',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    tmdb_rating: 85,
    release_year: 1994,
    genres: ['Crime', 'Drama'],
    match_reason: 'Classic non-linear narrative recommendation',
  },
];

function mapWeeklyMovieToCard(movie) {
  return {
    id: movie.tmdb_id,
    title: movie.title,
    image: movie.poster_url,
    rating: movie.tmdb_rating ? (movie.tmdb_rating / 10).toFixed(1) : '8.0',
    year: movie.release_year,
    genre: movie.genres,
    description: movie.match_reason,
  };
}

export default function ForYouComponent() {
  const { suggestions, remainingTries, loading, error, generateTry } = useWeeklySuggestions();
  const { isActive: isTourActive } = useTour() || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  const handleGenerateNextTry = async () => {
    if (remainingTries <= 0 || isGenerating) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      await generateTry();
    } catch (err) {
      setGenError(err.message || 'Failed to generate new suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const rawSuggestions =
    suggestions && suggestions.length > 0
      ? suggestions
      : isTourActive
        ? TOUR_FORYOU_PICKS
        : suggestions;

  const movies = rawSuggestions.map(mapWeeklyMovieToCard);
  const activeError = isTourActive ? null : error || genError;
  const isReactionsRequired = (activeError || '').toLowerCase().includes('reaction');

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-tour="foryou-hero">
        <div className={styles.heroHeaderContainer}>
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
              refreshed every Sunday.
            </p>
          </div>
        </div>

        {!isTourActive && loading && movies.length === 0 ? (
          <div className={styles.heroCardsWrap}>
            <div className={styles.heroCards}>
              {[1, 2, 3, 4, 5].map((item, i) => (
                <div key={item} className={styles.heroCardWrap} style={{ '--i': i }}>
                  <span className={clsx(styles.rankBadge, 'text-micro')}>#{i + 1}</span>
                  <MovieCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : movies.length > 0 ? (
          <div className={styles.heroCardsWrap}>
            <div
              className={clsx(
                styles.heroCards,
                !isTourActive && (loading || isGenerating) && styles.heroCardsDimmed
              )}
            >
              {movies.map((movie, i) => (
                <div key={movie.id || i} className={styles.heroCardWrap} style={{ '--i': i }}>
                  <span className={clsx(styles.rankBadge, 'text-micro')}>#{i + 1}</span>
                  <MovieCard movie={movie} showActions={false} />
                </div>
              ))}
            </div>
            {!isTourActive && (loading || isGenerating) && (
              <div className={styles.cardsLoaderOverlay}>
                <ScanRefreshLoader />
              </div>
            )}
          </div>
        ) : isReactionsRequired ? (
          <div className={styles.unlockCard}>
            <div className={styles.unlockIconWrap}>
              <Flame size={32} />
            </div>
            <div className={styles.unlockContent}>
              <h2 className={styles.unlockTitle}>Build Your Taste Profile</h2>
              <p className={styles.unlockDescription}>
                To generate personalized AI recommendations, we need to learn what you love. Rate or
                swipe at least <strong>20 movies</strong> on CineMatch to unlock your Top 5 Picks!
              </p>
              <div className={styles.unlockProgressContainer}>
                <div className={styles.unlockProgressBar}>
                  <div className={styles.unlockProgressFill} style={{ width: '35%' }} />
                </div>
                <span className={styles.unlockProgressLabel}>Taste Profile Building</span>
              </div>
              <Link href="/home" className={styles.unlockCtaBtn}>
                <Compass size={18} />
                <span>Start Swiping Movies Now</span>
              </Link>
            </div>
          </div>
        ) : activeError ? (
          <div className={styles.errorBox}>
            <AlertCircle size={20} />
            <span>{activeError}</span>
          </div>
        ) : null}
      </section>

      {movies.length > 0 && (
        <div className={styles.trySection} data-tour="foryou-suggest">
          <div className={styles.tryCounter}>
            <Sparkles size={20} className={styles.sparkleIcon} />
            <div className={styles.tryTextWrap}>
              <span className={styles.tryNumber}>{remainingTries}</span>
              <span className={styles.tryLabel}>Weekly Tries Remaining</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.refreshBtn}
            disabled={remainingTries <= 0 || loading || isGenerating}
            onClick={handleGenerateNextTry}
          >
            <RefreshCw size={18} className={isGenerating ? styles.spin : ''} />
            <span>{isGenerating ? 'Generating...' : 'Generate New Picks'}</span>
          </button>
        </div>
      )}
    </main>
  );
}
