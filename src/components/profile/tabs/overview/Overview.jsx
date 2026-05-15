'use client';

import clsx from 'clsx';
import { Plus, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import AddMovieModal from '@/components/elements/modals/addMovieModal/AddMovieModal';
import MovieCard from '@/components/elements/movieCard/MovieCard';
import ReviewCard from '@/components/elements/reviewcard/Reviewcard';
import Button from '@/components/ui/button/Button';
import { useAddFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useReviewsOverview, transformReviews } from '@/hooks/useReviews';
import { useGet } from '@/lib/api';
import { useToast } from '@/lib/toast/useToast';

import styles from './Overview.module.css';

export default function Overview({ onNavigateToReviews }) {
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [isAddFavOpen, setIsAddFavOpen] = useState(false);

  // Pagination state
  const [movies, setMovies] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const nextCursorRef = useRef(null);
  const cursorInFlightRef = useRef(null);
  const observerFiredRef = useRef(false);
  const observerTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (observerTimeoutRef.current) {
        clearTimeout(observerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showAllFavorites) {
      return;
    }

    if (observerTimeoutRef.current) {
      clearTimeout(observerTimeoutRef.current);
      observerTimeoutRef.current = null;
    }

    observerFiredRef.current = false;
  }, [showAllFavorites]);

  const buildUrl = useCallback((cursorParam) => {
    if (cursorParam) {
      return `/v1/favorites?cursor=${encodeURIComponent(cursorParam)}`;
    }

    return '/v1/favorites';
  }, []);

  // Fetch favorites
  const { data, mutate, loading } = useGet(buildUrl(cursor), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    noCache: true,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const apiMovies = data.favorites || [];
    const next = data.next_cursor ?? null;
    const total = data.total_count ?? 0;

    const cursorWeAreWaitingFor = cursorInFlightRef.current;

    nextCursorRef.current = next;

    if (cursorWeAreWaitingFor !== null && cursorWeAreWaitingFor !== cursor) {
      queueMicrotask(() => {
        setHasMore(next !== null);
      });

      return;
    }

    cursorInFlightRef.current = null;

    queueMicrotask(() => {
      setHasMore(next !== null);
      setTotalCount(total);
    });

    if (next === null) {
      observerFiredRef.current = false;
    } else {
      if (observerTimeoutRef.current) {
        clearTimeout(observerTimeoutRef.current);
      }

      observerTimeoutRef.current = setTimeout(() => {
        observerFiredRef.current = false;
        observerTimeoutRef.current = null;
      }, 500);
    }

    queueMicrotask(() => {
      setMovies((prev) => {
        if (cursor === null) {
          return apiMovies;
        }

        const existingIds = new Set(prev.map((m) => m.id));
        const newMovies = apiMovies.filter((m) => !existingIds.has(m.id));

        return [...prev, ...newMovies];
      });
    });
  }, [data, cursor]);

  // Intersection Observer for "See All"
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!showAllFavorites) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
          observerFiredRef.current = true;

          const nextCursor = nextCursorRef.current;

          cursorInFlightRef.current = nextCursor;

          setCursor(nextCursor);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [showAllFavorites]);

  // Carousel scroll handling
  const carouselRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);
  const carouselObserverRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (showAllFavorites) {
      if (carouselObserverRef.current) {
        carouselObserverRef.current.disconnect();
        carouselObserverRef.current = null;
      }

      return undefined;
    }

    const setupObserver = () => {
      if (!loadMoreTriggerRef.current) {
        return;
      }

      if (carouselObserverRef.current) {
        carouselObserverRef.current.disconnect();
      }

      carouselObserverRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;

          if (entry.isIntersecting && nextCursorRef.current && cursorInFlightRef.current === null) {
            cursorInFlightRef.current = nextCursorRef.current;

            setCursor(nextCursorRef.current);
          }
        },
        {
          threshold: 0,
          rootMargin: '0px',
        }
      );

      carouselObserverRef.current.observe(loadMoreTriggerRef.current);
    };

    const timer = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timer);

      if (carouselObserverRef.current) {
        carouselObserverRef.current.disconnect();
        carouselObserverRef.current = null;
      }
    };
  }, [showAllFavorites, movies.length]);

  const updateArrows = useCallback(() => {
    const el = carouselRef.current;

    if (!el) {
      return;
    }

    const hasOverflow = el.scrollWidth > el.clientWidth;

    setCanScrollLeft(hasOverflow && el.scrollLeft > 0);

    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;

    if (!el) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      updateArrows();
    });

    el.addEventListener('scroll', updateArrows, { passive: true });

    window.addEventListener('resize', updateArrows);

    return () => {
      cancelAnimationFrame(frame);

      el.removeEventListener('scroll', updateArrows);

      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, movies.length]);

  const scrollCarousel = useCallback((direction) => {
    const el = carouselRef.current;

    if (!el) {
      return;
    }

    const amount = el.clientWidth * 0.8;

    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  const [, , , triggerAddFav] = useAddFavorites();
  const [, , , triggerRemoveFav] = useRemoveFavorite();
  const { success, error: showError } = useToast();

  const handleAddFavorite = useCallback(
    async (incoming) => {
      const arr = Array.isArray(incoming) ? incoming : [incoming];

      const tmdbIds = arr.map((m) => m.tmdb_id || m.id);

      try {
        await triggerAddFav('/v1/favorites', {
          tmdb_ids: tmdbIds,
        });

        setCursor(null);

        queueMicrotask(() => {
          setHasMore(true);
        });

        nextCursorRef.current = null;
        cursorInFlightRef.current = null;

        mutate();

        success('Added to favorites', 'Movie saved to your favorites');
      } catch (err) {
        showError('Failed', err?.message || 'Could not add to favorites');
      }
    },
    [triggerAddFav, mutate, success, showError]
  );

  const handleRemoveFavorite = useCallback(
    async (id) => {
      try {
        await triggerRemoveFav(`/v1/favorites/${id}`, null, {
          allowEmptyBody: true,
        });

        setMovies((prev) => prev.filter((m) => m.id !== id));

        setTotalCount((prev) => Math.max(0, prev - 1));

        success('Removed from favorites', 'Movie removed from your favorites');
      } catch (err) {
        showError('Failed', err?.message || 'Could not remove from favorites');
      }
    },
    [triggerRemoveFav, success, showError]
  );

  const {
    reviews: apiReviews,
    loading: reviewsLoading,
    loadMoreRef: reviewLoadMoreRef,
  } = useReviewsOverview();

  const isInitialLoading = loading && movies.length === 0;
  const isLoadingMore = loading && movies.length > 0;

  const transformedReviews = useMemo(() => transformReviews(apiReviews), [apiReviews]);

  const mapMovie = useCallback((movie) => {
    return {
      id: movie.id,
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      year: movie.release_year,
      rating: movie.tmdb_rating,
      genre: movie.genres ?? [],
      image: movie.poster_url,
    };
  }, []);

  const carouselSkeletons = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => ({
      id: `carousel-skeleton-${index}`,
    }));
  }, []);

  const loadingMoreSkeletons = useMemo(() => {
    return Array.from({ length: 8 }, (_, index) => ({
      id: `more-skeleton-${index}`,
    }));
  }, []);

  const reviewSkeletons = useMemo(() => {
    return Array.from({ length: 2 }, (_, index) => ({
      id: `review-skeleton-${index}`,
    }));
  }, []);

  return (
    <div className={styles.overviewWrap}>
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={clsx(styles.sectionTitle, 'text-5xl', 'italic')}>Your Favorites</h2>

            <p className={clsx(styles.sectionSubtitle, 'text-xs')}>
              {isInitialLoading
                ? 'Loading your favorites...'
                : totalCount > 0
                  ? `${totalCount} film${totalCount !== 1 ? 's' : ''} in your collection.`
                  : 'The films that define your cinematic taste.'}
            </p>
          </div>

          <div className={styles.sectionActions}>
            <Button
              variant="primary"
              className={clsx(styles.addBtn, 'text-sm')}
              leftIcon={<Plus size={13} />}
              onClick={() => setIsAddFavOpen(true)}
              disabled={isInitialLoading}
            >
              Add
            </Button>

            <Button
              variant="secondary"
              className={clsx(styles.showmore, 'text-sm')}
              size="sm"
              onClick={() => setShowAllFavorites((v) => !v)}
              disabled={movies.length === 0 && !isInitialLoading}
            >
              {showAllFavorites ? 'Collapse' : 'See All'}
            </Button>
          </div>
        </div>

        {isInitialLoading && (
          <div className={styles.carouselWrap}>
            <div className={styles.carousel}>
              {carouselSkeletons.map((item) => (
                <div key={item.id} className={styles.carouselItem}>
                  <div className={styles.skeletonCard} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isInitialLoading && movies.length === 0 && !showAllFavorites && (
          <div className={styles.emptyFavorites}>
            <p>No favorites yet. Add some movies to get started!</p>
          </div>
        )}

        {showAllFavorites && !isInitialLoading && movies.length > 0 && (
          <>
            <div className={styles.favoritesGrid}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={mapMovie(movie)}
                  showActions
                  onDelete={() => handleRemoveFavorite(movie.id)}
                />
              ))}

              {isLoadingMore && hasMore && (
                <>
                  {loadingMoreSkeletons.map((item) => (
                    <div key={item.id} className={styles.skeletonCard} />
                  ))}
                </>
              )}
            </div>

            <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
              {hasMore && isLoadingMore && (
                <div className={styles.loadingMoreIndicator}>
                  <Loader2 size={20} className={styles.spinner} />
                  <span>Loading more...</span>
                </div>
              )}

              {!hasMore && movies.length > 0 && (
                <p className={styles.endMessage}>That&apos;s all for now! ✨</p>
              )}
            </div>
          </>
        )}

        {!showAllFavorites && !isInitialLoading && movies.length > 0 && (
          <div className={styles.carouselWrap}>
            <button
              type="button"
              aria-label="Scroll left"
              className={clsx(
                styles.carouselArrow,
                styles.carouselArrowLeft,
                !canScrollLeft && styles.carouselArrowDisabled
              )}
              onClick={() => scrollCarousel('left')}
              tabIndex={canScrollLeft ? 0 : -1}
            >
              <ChevronLeft size={16} />
            </button>

            <div className={styles.carousel} ref={carouselRef}>
              {movies.map((movie) => (
                <div key={movie.id} className={styles.carouselItem}>
                  <MovieCard
                    movie={mapMovie(movie)}
                    showActions
                    onDelete={() => handleRemoveFavorite(movie.id)}
                  />
                </div>
              ))}

              {isLoadingMore && (
                <div className={styles.carouselItem}>
                  <div className={styles.skeletonCard} style={{ minHeight: '20rem' }} />
                </div>
              )}

              <div
                ref={loadMoreTriggerRef}
                style={{
                  width: '1px',
                  height: '1px',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />

              <button
                type="button"
                className={styles.addCardPlaceholder}
                onClick={() => setIsAddFavOpen(true)}
              >
                <div className={styles.addCardIcon}>
                  <Plus size={24} />
                </div>

                <span className={clsx(styles.addCardText, 'text-xs')}>Add Favorite</span>
              </button>
            </div>

            <button
              type="button"
              aria-label="Scroll right"
              className={clsx(
                styles.carouselArrow,
                styles.carouselArrowRight,
                !canScrollRight && styles.carouselArrowDisabled
              )}
              onClick={() => scrollCarousel('right')}
              tabIndex={canScrollRight ? 0 : -1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={clsx(styles.sectionTitle, 'text-5xl', 'italic')}>Recent Reviews</h2>

            <p className={clsx(styles.sectionSubtitle, 'text-xs')}>
              Your latest thoughts on what you&apos;ve watched.
            </p>
          </div>

          <Button
            variant="secondary"
            className={clsx(styles.showmore, 'text-sm')}
            size="sm"
            rightIcon={<ArrowRight size={13} />}
            onClick={onNavigateToReviews}
          >
            View All
          </Button>
        </div>

        {/* Loading state with skeletons */}
        {reviewsLoading && transformedReviews.length === 0 ? (
          <div className={styles.reviewsGrid}>
            {reviewSkeletons.map((item) => (
              <div key={item.id} className={styles.reviewSkeletonCard}>
                <div className={styles.reviewSkeletonInner}>
                  <div className={styles.reviewSkeletonPoster} />
                  <div className={styles.reviewSkeletonContent}>
                    <div className={styles.reviewSkeletonLine} style={{ marginBottom: '8px' }}>
                      <div className={styles.reviewSkeletonLineWide} style={{ height: '18px' }} />
                    </div>
                    <div className={styles.reviewSkeletonLine} style={{ width: '80px' }} />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '100%', marginTop: '12px' }}
                    />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '80%', marginTop: '4px' }}
                    />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '60%', marginTop: '4px' }}
                    />
                  </div>
                  <div className={styles.reviewSkeletonRating} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={styles.reviewsGrid}>
              {transformedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} showStars={false} showActions={false} />
              ))}

              {reviewsLoading && transformedReviews.length > 0 && (
                <>
                  {Array.from({ length: 2 }, (_, index) => (
                    <div
                      key={`review-more-skeleton-${index}`}
                      className={styles.reviewSkeletonCard}
                    >
                      <div className={styles.reviewSkeletonInner}>
                        <div className={styles.reviewSkeletonPoster} />
                        <div className={styles.reviewSkeletonContent}>
                          <div className={styles.reviewSkeletonLine} style={{ height: '18px' }}>
                            <div
                              className={styles.reviewSkeletonLineWide}
                              style={{ height: '18px' }}
                            />
                          </div>
                          <div
                            className={styles.reviewSkeletonLine}
                            style={{ width: '80px', marginTop: '8px' }}
                          />
                        </div>
                        <div className={styles.reviewSkeletonRating} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div ref={reviewLoadMoreRef} style={{ minHeight: '20px' }} />
          </>
        )}
      </section>

      <AddMovieModal
        isOpen={isAddFavOpen}
        onClose={() => setIsAddFavOpen(false)}
        onAdd={handleAddFavorite}
        title="Add to Favorites"
        subtitle="Pick a film that defines your taste."
      />
    </div>
  );
}
