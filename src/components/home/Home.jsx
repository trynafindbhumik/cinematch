'use client';

import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Skull,
  Eye,
  X,
  RotateCcw,
  Star,
  Clock,
  Calendar,
  Info,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

import MovieDetailComponent from '@/components/movieDetails/MovieDetails';
import { DISCOVER_MOVIES, OTT_COLORS } from '@/mocks/data';

import styles from './Home.module.css';

const SWIPE_THRESHOLD = 80;

const ACTIONS = [
  { id: 'hate', label: 'Hate', Icon: Skull, dir: 'left', overlayKey: 'skip' },
  { id: 'dislike', label: 'Dislike', Icon: ThumbsDown, dir: 'left', overlayKey: 'skip' },
  { id: 'skip', label: 'Skip', Icon: X, dir: 'left', overlayKey: 'skip' },
  { id: 'watched', label: 'Watched', Icon: Eye, dir: 'up', overlayKey: 'watched' },
  { id: 'like', label: 'Like', Icon: ThumbsUp, dir: 'right', overlayKey: 'like' },
  { id: 'love', label: 'Love', Icon: Heart, dir: 'right', overlayKey: 'like' },
];

const SwipeCard = forwardRef(function SwipeCard(
  { movie, isTop, stackIndex, onSwipe, onOpenDetail },
  ref
) {
  const cardRef = useRef(null);
  const [overlay, setOverlay] = useState(null); // 'like' | 'skip' | 'watched' | null

  const startX = useRef(0);
  const startY = useRef(0);
  const curX = useRef(0);
  const curY = useRef(0);
  const dragged = useRef(false);
  const isDown = useRef(false);
  const flying = useRef(false);

  const resetOverlay = useCallback(() => setOverlay(null), []);

  const snapBack = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = '';
    el.style.boxShadow = '';
    resetOverlay();
  }, [resetOverlay]);

  const flyOff = useCallback(
    (direction, overlayKey = null) => {
      if (flying.current) return;
      flying.current = true;

      const el = cardRef.current;
      if (!el) return;

      if (overlayKey) setOverlay(overlayKey);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let tx = 0,
        ty = 0,
        rot = 0;

      if (direction === 'right') {
        tx = vw * 1.6;
        rot = 30;
      }
      if (direction === 'left') {
        tx = -vw * 1.6;
        rot = -30;
      }
      if (direction === 'up') {
        ty = -vh * 1.4;
      }

      el.style.transition = 'transform 0.42s ease-in, opacity 0.42s ease-in';
      el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      el.style.opacity = '0';

      setTimeout(() => onSwipe(direction), 420);
    },
    [onSwipe]
  );

  useImperativeHandle(
    ref,
    () => ({ swipe: (direction, overlayKey) => flyOff(direction, overlayKey) }),
    [flyOff]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (!isTop || flying.current) return;
      e.preventDefault();
      const el = cardRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'box-shadow 0.1s ease';
      startX.current = e.clientX;
      startY.current = e.clientY;
      curX.current = 0;
      curY.current = 0;
      dragged.current = false;
      isDown.current = true;
    },
    [isTop]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDown.current || !isTop) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragged.current = true;
      curX.current = dx;
      curY.current = dy;

      const el = cardRef.current;
      if (!el) return;

      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.07}deg)`;
      el.style.boxShadow = `${-dx * 0.05}px 12px 40px rgba(26,26,26,0.25)`;

      if (dx > 40) setOverlay('like');
      else if (dx < -40) setOverlay('skip');
      else if (dy < -40) setOverlay('watched');
      else setOverlay(null);
    },
    [isTop]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;

    if (!dragged.current) {
      onOpenDetail();
      const el = cardRef.current;
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
        el.style.boxShadow = '';
      }
      return;
    }

    const dx = curX.current;
    const dy = curY.current;

    if (dx > SWIPE_THRESHOLD) flyOff('right');
    else if (dx < -SWIPE_THRESHOLD) flyOff('left');
    else if (dy < -SWIPE_THRESHOLD) flyOff('up');
    else snapBack();
  }, [flyOff, snapBack, onOpenDetail]);

  const stackStyle =
    stackIndex > 0
      ? {
          transform: `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.05})`,
          zIndex: 10 - stackIndex,
          pointerEvents: 'none',
        }
      : { zIndex: 10 };

  return (
    <div
      ref={cardRef}
      className={`${styles.swipeCard} ${isTop ? styles.swipeCardTop : ''}`}
      style={stackStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={snapBack}
    >
      <Image
        src={movie.image}
        alt={movie.title}
        className={styles.poster}
        referrerPolicy="no-referrer"
        draggable={false}
        loading="eager"
        width={300}
        height={450}
      />

      <div
        className={`${styles.swipeOverlay} ${styles.overlayLike}`}
        style={{ opacity: overlay === 'like' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <Heart size={30} aria-hidden="true" />
          <span>LIKE</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlaySkip}`}
        style={{ opacity: overlay === 'skip' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <X size={30} aria-hidden="true" />
          <span>SKIP</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlayWatched}`}
        style={{ opacity: overlay === 'watched' ? 1 : 0 }}
      >
        <div className={styles.overlayBadge}>
          <Eye size={30} />
          <span>WATCHED</span>
        </div>
      </div>

      <div className={styles.topBar}>
        <div className={styles.ottRow}>
          {movie.ottPlatforms?.slice(0, 3).map((p) => (
            <span
              key={p}
              className={styles.ottDot}
              style={{ background: OTT_COLORS[p] ?? '#8c7851' }}
              title={p}
            />
          ))}
        </div>
        <div className={styles.ratingBadge}>
          <Star className={styles.ratingIcon} />
          <span>{movie.rating}</span>
        </div>
      </div>

      <button
        type="button"
        className={styles.infoBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail();
        }}
        aria-label={`View details for ${movie.title}`}
      >
        <Info size={14} />
      </button>

      <div className={styles.cardGradient} />
      <div className={styles.cardContent}>
        <div className={styles.genreRow}>
          {movie.genre?.slice(0, 3).map((g) => (
            <span key={g} className={styles.genrePill}>
              {g}
            </span>
          ))}
        </div>
        <h2 className={styles.cardTitle}>{movie.title}</h2>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <Calendar size={10} />
            {movie.year}
          </span>
          <span className={styles.metaDot} />
          <span className={styles.metaItem}>
            <Clock size={10} />
            {movie.runtime}
          </span>
          {movie.language && (
            <>
              <span className={styles.metaDot} />
              <span className={styles.metaItem}>{movie.language}</span>
            </>
          )}
        </div>
        <p className={styles.cardDesc}>{movie.description}</p>
        {movie.director && (
          <p className={styles.cardDir}>
            <span>Dir. </span>
            {movie.director}
          </p>
        )}
        <p className={styles.tapHint}>
          <Info size={9} />
          Tap card for full details
        </p>
      </div>
    </div>
  );
});

export default function HomeComponent() {
  const [movies, setMovies] = useState(DISCOVER_MOVIES);
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const topCardRef = useRef(null);
  const animatingRef = useRef(false);

  const handleSwipe = useCallback((direction, movie) => {
    setHistory((prev) => [...prev, { movie, direction }]);
    setMovies((prev) => prev.slice(1));
    animatingRef.current = false;
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const lastEntry = prev[prev.length - 1];
      const movieToRestore = lastEntry?.movie;
      if (!movieToRestore) return prev;
      setMovies((movies) => {
        if (movies.find((m) => m.id === movieToRestore.id)) return movies;
        return [movieToRestore, ...movies];
      });
      return prev.slice(0, -1);
    });
  }, []);

  const handleAction = useCallback(
    (action) => {
      if (animatingRef.current || !movies.length) return;
      const card = topCardRef.current;
      if (!card) return;
      animatingRef.current = true;
      card.swipe(action.dir, action.overlayKey);
      setTimeout(() => {
        animatingRef.current = false;
      }, 600);
    },
    [movies.length]
  );

  if (selectedMovie) {
    return <MovieDetailComponent movie={selectedMovie} onBack={() => setSelectedMovie(null)} />;
  }

  if (!movies.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Sparkles size={36} />
        </div>
        <h2 className={styles.emptyTitle}>You&apos;ve seen it all!</h2>
        <p className={styles.emptyText}>
          Your discovery queue is empty. Check back soon for fresh picks.
        </p>
        {history.length > 0 && (
          <button type="button" className={styles.undoBtn} onClick={handleUndo}>
            <RotateCcw size={13} />
            Undo last
          </button>
        )}
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
            {movies.length} film{movies.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
        <button
          type="button"
          className={styles.undoBtn}
          onClick={handleUndo}
          disabled={!history.length}
          aria-label="Undo last swipe"
        >
          <RotateCcw size={13} />
          Undo
        </button>
      </header>

      <div className={styles.deckArea}>
        <div className={styles.deck}>
          {[...visible].reverse().map((movie, index) => {
            const stackIndex = visible.length - 1 - index;
            const isTop = stackIndex === 0;
            return (
              <SwipeCard
                key={`${movie.id}-${stackIndex}`}
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

      {/* Action buttons */}
      <div className={styles.actionBar} role="group" aria-label="Reaction buttons">
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
