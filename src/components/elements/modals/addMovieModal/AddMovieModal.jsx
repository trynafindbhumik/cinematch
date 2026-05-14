'use client';

import clsx from 'clsx';
import { X, Search, Film, Clapperboard, Check, BookmarkPlus } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { useModal } from '@/context/ModalContext';
import { useTrendingMovies, useSearchMovies } from '@/hooks/useMovies';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

import sharedStyles from '../Modals.module.css';

import styles from './AddMovieModal.module.css';

/**
 * Props:
 *  - isOpen         : boolean
 *  - onClose        : () => void
 *  - onAdd          : (movies: Movie[]) => void | Promise
 *  - title          : string
 *  - subtitle       : string
 */
export default function AddMovieModal({ isOpen, onClose, onAdd, title = 'Add Movie', subtitle }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [isClosing, setIsClosing] = useState(false);

  const { openModal, closeModal } = useModal();

  const scrollBodyRef = useRef(null);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  useSwipeToClose(onClose, isOpen);

  // Trending movies hook
  const {
    movies: trendingMovies,
    hasMore: trendingHasMore,
    loading: trendingLoading,
    isFetchingMore: trendingIsFetchingMore,
    fetchNextPage: fetchTrendingNextPage,
    refresh: refreshTrendingMovies,
  } = useTrendingMovies({
    enabled: isOpen && !search.trim(),
  });

  // Search movies hook
  const {
    movies: searchResults,
    hasMore: searchHasMore,
    loading: searchLoading,
    isFetchingMore: searchIsFetchingMore,
    isDebouncing: searchIsDebouncing,
    fetchNextPage: fetchSearchNextPage,
    setQuery: setSearchQuery,
    clearSearch,
    query: currentSearchQuery,
  } = useSearchMovies('', {
    enabled: isOpen,
  });

  // Scroll to top when search query changes
  useEffect(() => {
    if (currentSearchQuery && scrollBodyRef.current) {
      scrollBodyRef.current.scrollTop = 0;
    }
  }, [currentSearchQuery]);

  // Determine which hook to use based on search state
  // isUserTyping: User has typed at least 2 characters
  // isTypingDebouncing: User is typing and API call hasn't been made yet
  // isSearchMode: API has been called and we have a debounced query
  const isUserTyping = search.trim().length >= 2;
  const isSearchMode = currentSearchQuery.length >= 2;

  // Check if we're in debounce phase (user typed but API not called yet)
  const isDebouncing = searchIsDebouncing;

  // When debouncing, don't show any movies (just show loading skeletons)
  const showMovies = !isDebouncing && (isSearchMode || !isUserTyping);

  // When debouncing, clear displayMovies to show loading skeletons
  const displayMovies = showMovies ? (isSearchMode ? searchResults : trendingMovies) : [];
  const movies = displayMovies;

  const hasMore = isSearchMode ? searchHasMore : trendingHasMore;

  // Loading states - show loading during debounce OR when fetching from API
  const isInitialLoading = (isSearchMode ? searchLoading : trendingLoading) && movies.length === 0;
  const loading = isDebouncing || isInitialLoading;
  const isFetchingMore = isSearchMode ? searchIsFetchingMore : trendingIsFetchingMore;

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return undefined;
    }

    const hasMovies = movies.length > 0;

    const setupObserver = setTimeout(
      () => {
        if (!loadMoreRef.current) return;

        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
              if (isSearchMode) {
                if (searchHasMore && !searchLoading) {
                  fetchSearchNextPage();
                }
              } else {
                if (trendingHasMore && !trendingLoading) {
                  fetchTrendingNextPage();
                }
              }
            }
          },
          { threshold: 0.1, rootMargin: '100px' }
        );

        observerRef.current.observe(loadMoreRef.current);
      },
      hasMovies ? 50 : 200
    );

    return () => {
      clearTimeout(setupObserver);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [
    isOpen,
    movies.length,
    isSearchMode,
    searchHasMore,
    trendingHasMore,
    searchLoading,
    trendingLoading,
    fetchSearchNextPage,
    fetchTrendingNextPage,
  ]);

  useEffect(() => {
    if (isOpen) openModal();
    return () => closeModal();
  }, [isOpen, openModal, closeModal]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value) => {
      setSearch(value);
      setSearchQuery(value);
    },
    [setSearchQuery]
  );

  // Handle clearing search - reset trending to page 1
  const handleClearSearch = useCallback(() => {
    setSearch('');
    clearSearch();
    refreshTrendingMovies();
  }, [clearSearch, refreshTrendingMovies]);

  const toggleSelect = useCallback((movie) => {
    const movieId = movie.tmdb_id || movie.id;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  const handleSheetAnimationEnd = useCallback(() => {
    if (isClosing) {
      setSelected(new Set());
      setSearch('');
      clearSearch();
      setIsClosing(false);
      onClose();
    }
  }, [isClosing, onClose, clearSearch]);

  const handleSubmit = useCallback(() => {
    const selectedMovies = movies.filter((m) => selected.has(m.tmdb_id || m.id));
    if (selectedMovies.length === 0) return;
    onAdd?.(selectedMovies);
    handleClose();
  }, [movies, selected, onAdd, handleClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen && !isClosing) return null;

  const FILM_DOTS = Array.from({ length: 14 }, (_, i) => `film-dot-${i}`);

  const modal = (
    <div
      className={clsx(sharedStyles.overlay, styles.sideOverlay, isClosing && styles.overlayClosing)}
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(styles.cinematicSheet, isClosing && styles.cinematicSheetClosing)}
        onAnimationEnd={handleSheetAnimationEnd}
      >
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

          <button type="button" className={styles.cinematicClose} onClick={handleClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.cinematicSearch}>
          <Input
            variant="filled"
            value={search}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Search for a movie…"
            prefixIcon={<Search size={18} />}
            showClearButton
          />
        </div>

        <div className={styles.listMeta}>
          <div className={clsx('text-xs', styles.resultsLabel)}>
            <Film size={11} />
            {isDebouncing ? (
              <span>Searching...</span>
            ) : loading ? (
              <span>Loading...</span>
            ) : isSearchMode ? (
              <span>
                {movies.length} results for &quot;
                {currentSearchQuery.length > 20
                  ? currentSearchQuery.slice(0, 20) + '...'
                  : currentSearchQuery}
                &quot;
              </span>
            ) : (
              <span>Trending movies</span>
            )}
          </div>

          {selected.size > 0 && (
            <button className={styles.clearSelBtn} onClick={() => setSelected(new Set())}>
              Clear selection
            </button>
          )}
        </div>

        <div ref={scrollBodyRef} className={styles.cinematicBody}>
          {/* Initial loading state with skeletons */}
          {loading && movies.length === 0 ? (
            <div className={styles.cinematicMovieList}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.movieRowSkeleton}>
                  <div className={styles.skeletonThumb} />
                  <div className={styles.skeletonInfo}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonMeta} />
                  </div>
                </div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className={styles.cinematicMovieList}>
                {movies.map((movie) => {
                  const movieId = movie.tmdb_id || movie.id;
                  const isSelected = selected.has(movieId);

                  return (
                    <button
                      key={movieId}
                      className={clsx(
                        styles.cinematicMovieRow,
                        isSelected && styles.cinematicMovieRowSelected
                      )}
                      onClick={() => toggleSelect(movie)}
                    >
                      <div className={styles.cinematicThumb}>
                        <Image
                          src={movie.poster_url || '/placeholder.png'}
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
                          <Check size={14} />
                        </div>
                      </div>

                      <div className={styles.cinematicMovieInfo}>
                        <p className={styles.cinematicMovieTitle}>{movie.title}</p>
                        <p className={styles.cinematicMovieMeta}>
                          {movie.release_year}
                          {movie.genres?.length > 0 && ` • ${movie.genres.slice(0, 2).join(', ')}`}
                        </p>
                      </div>

                      <div className={styles.toggleIndicator}>
                        {isSelected ? <Check size={14} /> : '+'}
                      </div>
                    </button>
                  );
                })}

                {/* Load more trigger for infinite scroll */}
                <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                  {isFetchingMore && (
                    <div className={styles.skeletonRows}>
                      {[1, 2, 3].map((i) => (
                        <div key={`skeleton-more-${i}`} className={styles.movieRowSkeleton}>
                          <div className={styles.skeletonThumb} />
                          <div className={styles.skeletonInfo}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonMeta} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasMore && movies.length > 0 && (
                    <span className={styles.endMessage}>No more movies</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.cinematicEmpty}>
              <Film size={30} />
              <p>
                {isDebouncing
                  ? 'Searching...'
                  : isSearchMode
                    ? 'No films found'
                    : 'No trending movies'}
              </p>
              {isSearchMode && search.length > 20 && (
                <p className={styles.truncatedQuery}>for &quot;{search.slice(0, 20)}...&quot;</p>
              )}
            </div>
          )}
        </div>

        <div
          className={clsx(
            styles.selectionFooter,
            selected.size > 0 && styles.selectionFooterVisible
          )}
        >
          <div className={styles.selectionPreviews}>
            {movies
              .filter((m) => selected.has(m.tmdb_id || m.id))
              .slice(0, 5)
              .map((m, i) => (
                <div
                  key={m.tmdb_id || m.id}
                  className={styles.previewThumb}
                  style={{ zIndex: 10 - i, transform: `translateX(${i * -9}px)` }}
                >
                  <Image
                    src={m.poster_url || '/placeholder.png'}
                    alt={m.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
              ))}
            {selected.size > 5 && (
              <div
                className={styles.previewOverflow}
                style={{ zIndex: 4, transform: 'translateX(-45px)' }}
              >
                +{selected.size - 5}
              </div>
            )}
          </div>

          <div className={styles.selectionInfo}>
            <span className={clsx('h-2xl', styles.selectionCount)}>{selected.size}</span>
            <span className={clsx('text-xs', styles.selectionLabel)}>
              {selected.size === 1 ? 'film' : 'films'} selected
            </span>
          </div>

          <button
            type="button"
            className={clsx('text-sm', styles.submitBtn)}
            onClick={handleSubmit}
          >
            <BookmarkPlus size={15} />
            <span className={styles.submitBtnLabel}>Add to Collection</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
