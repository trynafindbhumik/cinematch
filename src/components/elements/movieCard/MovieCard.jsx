'use client';

import clsx from 'clsx';
import { Bookmark, Heart, Trash2, Star } from 'lucide-react';
import Image from 'next/image';

import styles from './MovieCard.module.css';

/**
 *
 * Props:
 *  - movie          : { id, title, year, genre, rating, image, description }
 *  - tag            : optional string badge (top-left, e.g. "Watched")
 *  - showActions    : show quick-action buttons on hover (default true)
 *  - onLike         : () => void
 *  - onSkip         : () => void
 *  - onSave         : () => void
 *  - onClick        : () => void
 *  - className      : extra class
 */
export default function MovieCard({
  movie,
  tag,
  showActions = true,
  onLike,
  onSkip,
  onSave,
  onClick,
  className,
}) {
  if (!movie) return null;

  return (
    <div
      className={clsx(styles.card, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={styles.imageWrap}>
        <Image
          src={movie.image}
          alt={movie.title}
          className={styles.image}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          referrerPolicy="no-referrer"
        />
        <div className={styles.imageGradient} />

        <div className={styles.ratingBadge}>
          <Star className={styles.ratingIcon} />
          <span className={clsx('text-micro', styles.ratingText)}>{movie.rating}</span>
        </div>

        {tag && <span className={clsx('text-micro', styles.tagBadge)}>{tag}</span>}

        {showActions && onSkip && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            aria-label="Remove from watchlist"
          >
            <Trash2 size={11} />
          </button>
        )}

        {showActions && (onSave || onLike) && (
          <div className={styles.quickActions}>
            {onSave && (
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.actionBtnAdd)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                aria-label="Save to watchlist"
              >
                <Bookmark className={styles.actionBtnIcon} />
              </button>
            )}
            {onLike && (
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.actionBtnLike)}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                aria-label="Like"
              >
                <Heart className={styles.actionBtnIcon} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={clsx('h-lg', styles.title)}>{movie.title}</h3>
        <div className={styles.meta}>
          <span className={clsx('text-micro', styles.year)}>{movie.year}</span>
          {movie.genre?.[0] && (
            <span className={clsx('text-micro', styles.genre)}>{movie.genre[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
}
