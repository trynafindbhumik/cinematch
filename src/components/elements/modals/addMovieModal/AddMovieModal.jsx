'use client';

import clsx from 'clsx';
import { X, Search, Film, Clapperboard, Check, BookmarkPlus } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { MOCK_MOVIES } from '@/mocks/data';

import sharedStyles from '../Modals.module.css';

import styles from './AddMovieModal.module.css';

/**
 * AddMovieModal — rendered into document.body via React Portal
 * so the overlay always covers the full viewport, regardless of
 * where in the component tree this is rendered.
 *
 * Props:
 *  - isOpen    : boolean
 *  - onClose   : () => void
 *  - onAdd     : (movies: Movie[]) => void
 *  - title     : modal heading
 *  - subtitle  : optional subtitle
 */
export default function AddMovieModal({ isOpen, onClose, onAdd, title = 'Add Movie', subtitle }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const prev = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;
  if (!isOpen) return null;

  const filtered = MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (movie) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(movie.id) ? next.delete(movie.id) : next.add(movie.id);
      return next;
    });
  };

  const selectedMovies = MOCK_MOVIES.filter((m) => selected.has(m.id));
  const count = selected.size;

  const handleSubmit = () => {
    if (count === 0) return;
    onAdd?.(selectedMovies);
    setSelected(new Set());
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const FILM_DOTS = Array.from({ length: 14 }, (_, i) => `film-dot-${i}`);

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={clsx(sharedStyles.mobileHandle, styles.mobileHandle)} />
      <div className={styles.cinematicSheet}>
        <div className={styles.cinematicHeader}>
          <div className={styles.filmStrip}>
            {FILM_DOTS.map((key) => (
              <span key={key} className={styles.filmDot} />
            ))}
          </div>

          <div className={styles.cinematicHeaderContent}>
            <div className={styles.cinematicIconWrap}>
              <Clapperboard size={20} />
            </div>
            <div className={styles.cinematicTitleGroup}>
              <p className={clsx('text-micro', styles.cinematicEyebrow)}>Your Collection</p>
              <h2 className={clsx('h-2xl', 'italic', styles.cinematicTitle)}>{title}</h2>
              {subtitle && <p className={styles.cinematicSubtitle}>{subtitle}</p>}
            </div>
          </div>

          <div className={styles.filmStrip}>
            {FILM_DOTS.map((key) => (
              <span key={key} className={styles.filmDot} />
            ))}
          </div>

          <button
            type="button"
            className={styles.cinematicClose}
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.cinematicSearch}>
          <Input
            variant="filled"
            value={search}
            onChange={setSearch}
            placeholder="Search for a movie…"
            prefixIcon={<Search size={18} />}
            autoFocus
          />
        </div>

        <div className={styles.listMeta}>
          <div className={clsx('text-xs', styles.resultsLabel)}>
            <Film size={11} />
            {search ? (
              <span>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}
                &rdquo;
              </span>
            ) : (
              <span>{MOCK_MOVIES.length} films available</span>
            )}
          </div>
          {count > 0 && (
            <button
              type="button"
              className={clsx('text-xs', styles.clearSelBtn)}
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </button>
          )}
        </div>

        <div className={clsx(styles.cinematicBody, count > 0 && styles.cinematicBodyPadded)}>
          {filtered.length > 0 ? (
            <div className={styles.cinematicMovieList}>
              {filtered.map((movie, index) => {
                const isSelected = selected.has(movie.id);
                return (
                  <button
                    key={movie.id}
                    type="button"
                    className={clsx(
                      styles.cinematicMovieRow,
                      isSelected && styles.cinematicMovieRowSelected
                    )}
                    onClick={() => toggleSelect(movie)}
                    style={{ animationDelay: `${index * 0.035}s` }}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.cinematicThumb}>
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                      <div
                        className={clsx(
                          styles.selectedOverlay,
                          isSelected && styles.selectedOverlayActive
                        )}
                      >
                        <div className={styles.selectedCheck}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.cinematicMovieInfo}>
                      <p className={clsx('h-md', styles.cinematicMovieTitle)}>{movie.title}</p>
                      <p className={styles.cinematicMovieMeta}>
                        <span className={styles.cinematicYear}>{movie.year}</span>
                        <span className={styles.metaDot}>·</span>
                        <span>{movie.genre.join(', ')}</span>
                      </p>
                    </div>

                    <div
                      className={clsx(
                        styles.toggleIndicator,
                        isSelected && styles.toggleIndicatorSelected
                      )}
                    >
                      {isSelected ? (
                        <Check size={13} strokeWidth={2.5} />
                      ) : (
                        <span className={styles.togglePlus}>+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.cinematicEmpty}>
              <div className={styles.cinematicEmptyIcon}>
                <Film size={30} />
              </div>
              <p className={clsx('h-xl', 'italic', styles.cinematicEmptyTitle)}>No films found</p>
              <p className={clsx('text-base', styles.cinematicEmptyText)}>
                Nothing matches &ldquo;{search}&rdquo; — try a different title.
              </p>
            </div>
          )}
        </div>

        <div className={clsx(styles.selectionFooter, count > 0 && styles.selectionFooterVisible)}>
          <div className={styles.selectionPreviews}>
            {selectedMovies.slice(0, 5).map((m, i) => (
              <div
                key={m.id}
                className={styles.previewThumb}
                style={{
                  zIndex: 10 - i,
                  transform: `translateX(${i * -9}px)`,
                }}
              >
                <Image
                  src={m.image}
                  alt={m.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </div>
            ))}
            {count > 5 && (
              <div
                className={styles.previewOverflow}
                style={{ zIndex: 4, transform: `translateX(${5 * -9}px)` }}
              >
                +{count - 5}
              </div>
            )}
          </div>

          <div className={styles.selectionInfo}>
            <span className={clsx('h-2xl', styles.selectionCount)}>{count}</span>
            <span className={clsx('text-xs', styles.selectionLabel)}>
              {count === 1 ? 'film' : 'films'} selected
            </span>
          </div>

          <button
            type="button"
            className={clsx('text-sm', styles.submitBtn)}
            onClick={handleSubmit}
          >
            <BookmarkPlus size={15} />
            <span className={styles.submitBtnLabel}>Add to Watchlist</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
