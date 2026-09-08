'use client';

import { Calendar, Clock, Info, Star, Heart, ThumbsUp, ThumbsDown, Skull, X } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import styles from './Home.module.css';

const SWIPE_THRESHOLD = 80;
const OTT_COLORS = {
  Netflix: '#E50914',
  'Prime Video': '#00A8E1',
  'Disney+': '#113CCF',
  Hulu: '#1CE783',
  'HBO Max': '#5822B4',
  AppleTV: '#A3A3A3',
};

const SwipeCard = forwardRef(function SwipeCard(
  { movie, isTop, stackIndex, onSwipe, onOpenDetail },
  ref
) {
  const cardRef = useRef(null);
  const [overlay, setOverlay] = useState(null);

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

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;
      let tx = 0,
        ty = 0,
        rot = 0;

      if (direction === 'right') {
        tx = vw * 1.6;
        rot = 30;
      } else if (direction === 'left') {
        tx = -vw * 1.6;
        rot = -30;
      } else if (direction === 'up') {
        ty = -vh * 1.4;
      }

      el.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
      el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      el.style.opacity = '0';

      setTimeout(() => onSwipe(direction), 300);
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
      else if (dy < -40) setOverlay('hate');
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
          transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
        }
      : {
          zIndex: 10,
          transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
        };

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
        src={movie.image || '/placeholder-poster.png'}
        alt={movie.title}
        className={styles.poster}
        referrerPolicy="no-referrer"
        draggable={false}
        loading="eager"
        width={300}
        height={450}
        unoptimized
      />

      <div
        className={`${styles.swipeOverlay} ${styles.overlayLike}`}
        style={{ opacity: overlay === 'like' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <ThumbsUp size={30} />
          <span>LIKE</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlayLove}`}
        style={{ opacity: overlay === 'love' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <Heart size={30} />
          <span>LOVE</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlaySkip}`}
        style={{ opacity: overlay === 'skip' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <X size={30} />
          <span>SKIP</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlayDislike}`}
        style={{ opacity: overlay === 'dislike' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <ThumbsDown size={30} />
          <span>NOPE</span>
        </div>
      </div>
      <div
        className={`${styles.swipeOverlay} ${styles.overlayHate}`}
        style={{ opacity: overlay === 'hate' ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className={styles.overlayBadge}>
          <Skull size={30} />
          <span>HATE</span>
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
        </div>
        <p className={styles.cardDesc}>{movie.description}</p>
        <p className={styles.tapHint}>
          <Info size={9} />
          Tap card for full details
        </p>
      </div>
    </div>
  );
});

export default SwipeCard;
