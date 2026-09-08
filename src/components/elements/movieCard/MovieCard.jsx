'use client';

import clsx from 'clsx';
import { Trash2, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import styles from './MovieCard.module.css';

/**
 *
 * Props:
 *  - movie          : { id, title, year, genre, rating, image, description }
 *  - tag            : optional string badge (top-left, e.g. "Watched")
 *  - showActions    : show quick-action buttons on hover (default true)
 *  - onDelete       : () => void
 *  - onClick        : () => void
 *  - isDeleting     : boolean
 *  - className      : extra class
 */
export default function MovieCard({
  movie,
  tag,
  showActions = true,
  onDelete,
  onClick,
  isDeleting = false,
  className,
}) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={clsx(styles.card, isDeleting && styles.cardDeleting, className)}
      onClick={!isDeleting ? onClick : undefined}
      role={onClick && !isDeleting ? 'button' : undefined}
      tabIndex={onClick && !isDeleting ? 0 : undefined}
      onKeyDown={onClick && !isDeleting ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={styles.imageWrap}>
        {!imageError ? (
          <Image
            src={movie.image}
            alt={movie.description ? movie.title : `Poster for ${movie.title}`}
            className={styles.image}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={handleImageError}
            unoptimized
          />
        ) : (
          <div className={styles.posterPlaceholder} />
        )}
        <div className={styles.imageGradient} />

        {isDeleting && (
          <div className={styles.deletingOverlay}>
            <Loader2 size={24} className={styles.deletingSpinner} />
          </div>
        )}

        <div className={styles.ratingBadge}>
          <Star className={styles.ratingIcon} />
          <span className={clsx('text-micro', styles.ratingText)}>{movie.rating}</span>
        </div>

        {tag && <span className={clsx('text-micro', styles.tagBadge)}>{tag}</span>}

        {showActions && onDelete && (
          <button
            type="button"
            className={clsx(styles.removeBtn, isDeleting && styles.removeBtnDeleting)}
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleting) onDelete();
            }}
            aria-label="Remove from collection"
          >
            {isDeleting ? <Loader2 size={11} className={styles.spinIcon} /> : <Trash2 size={11} />}
          </button>
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
