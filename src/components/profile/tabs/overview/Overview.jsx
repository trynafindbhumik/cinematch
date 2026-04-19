'use client';

import clsx from 'clsx';
import { Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

import AddMovieModal from '@/components/elements/modals/addMovieModal/AddMovieModal';
import MovieCard from '@/components/elements/movieCard/MovieCard';
import ReviewCard from '@/components/elements/reviewcard/Reviewcard';
import Button from '@/components/ui/button/Button';
import { MOCK_MOVIES, MOCK_REVIEWS } from '@/mocks/data';

import styles from './Overview.module.css';

export default function Overview({ onNavigateToReviews }) {
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [isAddFavOpen, setIsAddFavOpen] = useState(false);
  const [favorites, setFavorites] = useState(MOCK_MOVIES);

  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return undefined;

    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, favorites]);

  const scrollCarousel = useCallback((direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const handleAddFavorite = (incoming) => {
    const arr = Array.isArray(incoming) ? incoming : [incoming];
    setFavorites((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      return [...prev, ...arr.filter((m) => !ids.has(m.id))];
    });
  };

  const handleRemoveFavorite = (id) => {
    setFavorites((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className={styles.overviewWrap}>
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={clsx(styles.sectionTitle, 'text-5xl', 'italic')}>Your Favorites</h2>
            <p className={clsx(styles.sectionSubtitle, 'text-xs')}>
              The films that define your cinematic taste.
            </p>
          </div>

          <div className={styles.sectionActions}>
            <Button
              variant="primary"
              className={clsx(styles.addBtn, 'text-sm')}
              leftIcon={<Plus size={13} />}
              onClick={() => setIsAddFavOpen(true)}
            >
              Add
            </Button>
            <Button
              variant="secondary"
              className={clsx(styles.showmore, 'text-sm')}
              size="sm"
              onClick={() => setShowAllFavorites((v) => !v)}
            >
              {showAllFavorites ? 'Collapse' : 'See All'}
            </Button>
          </div>
        </div>

        {showAllFavorites ? (
          <div className={styles.favoritesGrid}>
            {favorites.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showActions
                onSkip={() => handleRemoveFavorite(movie.id)}
              />
            ))}
          </div>
        ) : (
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
              {favorites.map((movie) => (
                <div key={movie.id} className={styles.carouselItem}>
                  <MovieCard
                    movie={movie}
                    showActions
                    onSkip={() => handleRemoveFavorite(movie.id)}
                  />
                </div>
              ))}

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

        <div className={styles.reviewsGrid}>
          {MOCK_REVIEWS.slice(0, 2).map((review) => (
            <ReviewCard key={review.id} review={review} showStars={false} />
          ))}
        </div>
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
