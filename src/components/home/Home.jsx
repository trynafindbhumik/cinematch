'use client';

import { Sparkles, Heart, ThumbsUp, ThumbsDown, Skull, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

import SwipeCard from '@/components/home/SwipeCard';
import MovieDetailComponent from '@/components/movieDetails/MovieDetails';
import { useTour } from '@/context/TourContext';
import { useReaction } from '@/hooks/useReaction';
import useSuggestions from '@/hooks/useSuggestions';

import styles from './Home.module.css';

const ACTIONS = [
  { id: 'hate', label: 'Hate', Icon: Skull, dir: 'left', overlayKey: 'hate' },
  { id: 'dislike', label: 'Dislike', Icon: ThumbsDown, dir: 'left', overlayKey: 'dislike' },
  { id: 'skip', label: 'Skip', Icon: X, dir: 'left', overlayKey: 'skip' },
  { id: 'like', label: 'Like', Icon: ThumbsUp, dir: 'right', overlayKey: 'like' },
  { id: 'love', label: 'Love', Icon: Heart, dir: 'right', overlayKey: 'love' },
];

function mapMovieDetailsToCard(item) {
  if (!item) return null;
  return {
    ...item,
    id: item.tmdb_id || item.id,
    title: item.title || 'Untitled',
    image: item.poster_url || item.image || '/placeholder-poster.png',
    backdrop: item.backdrop_url || item.backdrop || item.poster_url || item.image,
    rating: item.tmdb_rating
      ? Number(item.tmdb_rating) > 10
        ? (Number(item.tmdb_rating) / 10).toFixed(1)
        : Number(item.tmdb_rating).toFixed(1)
      : item.rating || '8.0',
    year:
      item.release_year ||
      item.year ||
      (item.release_date ? String(item.release_date).slice(0, 4) : '2024'),
    runtime: typeof item.runtime === 'number' ? `${item.runtime} min` : item.runtime || '120 min',
    description: item.tagline || item.overview || item.description || '',
    genre: item.genres || item.genre || [],
    genres: item.genres || item.genre || [],
    ottPlatforms: item.ott_platforms || item.ottPlatforms || ['Netflix'],
  };
}

const TOUR_SWIPE_DUMMY = [
  {
    id: 550,
    tmdb_id: 550,
    title: 'Fight Club',
    poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    tmdb_rating: 84,
    release_year: 1999,
    genres: ['Drama', 'Thriller'],
    tagline: 'Mischief. Mayhem. Soap.',
  },
  {
    id: 157336,
    tmdb_id: 157336,
    title: 'Interstellar',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    tmdb_rating: 86,
    release_year: 2014,
    genres: ['Sci-Fi', 'Drama'],
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
  },
  {
    id: 27205,
    tmdb_id: 27205,
    title: 'Inception',
    poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEW9W2vBBGLB2JSXA3iMoVpq.jpg',
    tmdb_rating: 83,
    release_year: 2010,
    genres: ['Action', 'Sci-Fi'],
    tagline: 'Your mind is the scene of the crime.',
  },
];

export default function HomeComponent() {
  const { suggestions, currentIndex, setCurrentIndex, isGenerating, error, generate } =
    useSuggestions();
  const { submitReaction } = useReaction();
  const { isActive: isTourActive } = useTour() || {};

  const [tourIndex, setTourIndex] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const topCardRef = useRef(null);
  const animatingRef = useRef(false);

  const rawList = isTourActive
    ? TOUR_SWIPE_DUMMY
    : suggestions && suggestions.length > 0
      ? suggestions
      : [];

  const effectiveIndex = isTourActive ? tourIndex : currentIndex;

  const movies = (rawList || [])
    .slice(effectiveIndex, effectiveIndex + 3)
    .map(mapMovieDetailsToCard)
    .filter(Boolean);

  const handleSwipe = useCallback(
    (direction, movie) => {
      if (isTourActive) {
        setTourIndex((prev) => prev + 1);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
      const dirToReaction = { right: 'like', left: 'skip' };
      const reaction = dirToReaction[direction];
      if (reaction && !isTourActive) submitReaction(movie.id, reaction);
      animatingRef.current = false;
    },
    [submitReaction, isTourActive, setCurrentIndex]
  );

  const handleAction = useCallback(
    (action) => {
      if (animatingRef.current || !movies.length) return;
      const card = topCardRef.current;
      if (!card) return;
      animatingRef.current = true;
      const movie = movies[0];
      if (!isTourActive) submitReaction(movie.id, action.id);
      card.swipe(action.dir, action.overlayKey);
      setTimeout(() => {
        animatingRef.current = false;
      }, 350);
    },
    [movies, submitReaction, isTourActive]
  );

  if (selectedMovie) {
    return <MovieDetailComponent movie={selectedMovie} onBack={() => setSelectedMovie(null)} />;
  }

  if (!isTourActive && isGenerating) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Sparkles size={36} />
        </div>
        <h2 className={styles.emptyTitle}>Loading suggestions...</h2>
      </div>
    );
  }

  if (!isTourActive && error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Sparkles size={36} />
        </div>
        <h2 className={styles.emptyTitle}>Something went wrong</h2>
        <p className={styles.emptyText}>{error}</p>
        <button type="button" className={styles.undoBtn} onClick={generate}>
          Retry
        </button>
      </div>
    );
  }

  if (!isTourActive && !movies.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Sparkles size={36} />
        </div>
        <h2 className={styles.emptyTitle}>You&apos;ve seen it all!</h2>
        <p className={styles.emptyText}>
          Your discovery queue is empty. Check back soon for fresh picks.
        </p>
        <button type="button" className={styles.undoBtn} onClick={generate}>
          Retry
        </button>
      </div>
    );
  }

  const visible = movies.slice(0, 3);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Discover</h1>
          <p className={styles.pageSubtitle}>
            {Math.max(0, rawList.length - effectiveIndex)} film
            {rawList.length - effectiveIndex !== 1 ? 's' : ''} in queue
          </p>
        </div>
      </header>

      <div className={styles.deckArea} data-tour="swipe-deck">
        <div className={styles.deck}>
          {[...visible].reverse().map((movie, index) => {
            const stackIndex = visible.length - 1 - index;
            const isTop = stackIndex === 0;
            return (
              <SwipeCard
                key={movie.id}
                ref={isTop ? topCardRef : null}
                movie={movie}
                isTop={isTop}
                stackIndex={stackIndex}
                onSwipe={(dir) => handleSwipe(dir, movie)}
                onOpenDetail={() => setSelectedMovie(movie)}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.swipeHint} aria-hidden="true">
        <span>← skip</span>
        <span>swipe to react</span>
        <span>love →</span>
      </div>

      <div
        className={styles.actionBar}
        role="group"
        aria-label="Reaction buttons"
        data-tour="action-bar"
      >
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`${styles.actionBtn} ${styles[`ab_${action.id}`]}`}
            onClick={() => handleAction(action)}
            aria-label={action.label}
          >
            <span className={styles.actionIconWrap}>
              <action.Icon size={17} />
            </span>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
