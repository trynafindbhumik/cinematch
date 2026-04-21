'use client';

import clsx from 'clsx';
import { Star, X, Calendar, Film, Trash2, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './ReviewModal.module.css';

function StarRow({ rating, max = 5 }) {
  return (
    <div className={styles.starRow} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} className={i < rating ? styles.starFilled : styles.starEmpty} />
      ))}
      <span className={clsx('text-xs', styles.starLabel)}>
        {rating}/{max}
      </span>
    </div>
  );
}

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return raw; // already a string like "Mar 2025"
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function useFocusTrap(ref, isOpen) {
  useEffect(() => {
    if (!isOpen || !ref.current) {
      return undefined;
    }

    const el = ref.current;
    const focusable = el.querySelectorAll(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const previouslyFocused = document.activeElement;
    first?.focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', handleTab);

    return () => {
      el.removeEventListener('keydown', handleTab);
      previouslyFocused?.focus();
    };
  }, [ref, isOpen]);
}

export default function ReviewModal({ review, onClose, onEdit, onDelete }) {
  const modalRef = useRef(null);
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const titleId = `review-modal-title-${review?.id ?? 'default'}`;

  const handleGoToMovie = () => {
    if (review.movieId) {
      router.push(`/movie/${review.movieId}`);
    }
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isClosing) document.body.style.overflow = prev;
    else document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isClosing]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
  };

  const handleSheetAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useFocusTrap(modalRef, !isClosing);

  if (typeof window === 'undefined') return null;
  if (!review) return null;

  const modal = (
    <div
      className={clsx(styles.backdrop, isClosing && styles.backdropClosing)}
      onClick={handleBackdropClick}
      aria-hidden={false}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(styles.modal, isClosing && styles.modalClosing)}
        onAnimationEnd={handleSheetAnimationEnd}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close review"
        >
          <X size={16} />
        </button>

        <div className={styles.header}>
          {review.moviePoster && (
            <div className={styles.posterWrap}>
              <Image
                src={review.moviePoster}
                alt={review.movieTitle}
                className={styles.poster}
                referrerPolicy="no-referrer"
                width={80}
                height={120}
                loading="eager"
              />
            </div>
          )}

          <div className={styles.headerMeta}>
            <span className={clsx('text-micro', styles.eyebrow)}>
              <Film size={9} />
              Film Review
            </span>

            <h2 id={titleId} className={clsx('h-3xl', styles.movieTitle)}>
              {review.movieTitle}
            </h2>

            <StarRow rating={review.rating} />

            {review.date && (
              <div className={clsx('text-micro', styles.dateLine)}>
                <Calendar size={9} />
                {formatDate(review.date)}
              </div>
            )}
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.commentSection}>
          <span className={clsx('text-micro', styles.commentLabel)}>Review</span>
          <blockquote className={clsx('italic', styles.comment)}>
            &ldquo;{review.comment}&rdquo;
          </blockquote>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionLeft}>
            {review.movieId && (
              <button
                type="button"
                className={clsx('text-xs', styles.goMovieBtn)}
                onClick={handleGoToMovie}
              >
                <Film size={12} />
                Go to Movie
              </button>
            )}
          </div>

          <div className={styles.actionRight}>
            {onEdit && (
              <button
                type="button"
                className={clsx('text-xs', styles.editBtn)}
                onClick={() => onEdit(review)}
                aria-label="Edit review"
              >
                <Edit2 size={12} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className={clsx('text-xs', styles.deleteBtn)}
                onClick={() => onDelete(review)}
                aria-label="Delete review"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
            <button
              type="button"
              className={clsx('text-xs', styles.dismissBtn)}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
