'use client';

import clsx from 'clsx';
import { Plus, ArrowRight, Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import AddMovieModal from '@/components/elements/modals/addMovieModal/AddMovieModal';
import MovieCard from '@/components/elements/movieCard/MovieCard';
import Button from '@/components/ui/button/Button';
import { MOCK_MOVIES, MOCK_REVIEWS } from '@/mocks/data';

import styles from './Overview.module.css';

export default function Overview({ onNavigateToReviews }) {
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [isAddFavOpen, setIsAddFavOpen] = useState(false);
  const [favorites, setFavorites] = useState(MOCK_MOVIES.slice(0, 4));

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
            <div className={styles.carousel}>
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
          {MOCK_REVIEWS.length === 0 ? (
            <div className={styles.emptyReviews}>
              <div className={styles.emptyReviewsIcon}>
                <Star size={24} />
              </div>
              <p className={clsx('text-base-tight', styles.emptyReviewsTitle)}>No reviews yet</p>
              <p className={clsx('text-micro', styles.emptyReviewsSubtitle)}>
                Start rating movies to see your reviews here.
              </p>
            </div>
          ) : (
            MOCK_REVIEWS.slice(0, 2).map((review) => <ReviewCard key={review.id} review={review} />)
          )}
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

function ReviewCard({ review }) {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewCardInner}>
        <div className={styles.reviewPoster}>
          <Image
            src={review.moviePoster}
            alt={review.movieTitle}
            fill
            sizes="72px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.reviewContent}>
          <div className={styles.reviewHeader}>
            <div>
              <h4 className={clsx(styles.reviewTitle, 'h-lg')}>{review.movieTitle}</h4>
              <p className={styles.reviewDate}>{review.date}</p>
            </div>
            <div className={styles.reviewRating}>
              <Star className={styles.reviewRatingIcon} />
              <span className={clsx(styles.reviewRatingText, 'text-sm')}>{review.rating}</span>
            </div>
          </div>

          <p className={clsx(styles.reviewComment, 'italic')}>&ldquo;{review.comment}&rdquo;</p>

          <button type="button" className={clsx(styles.reviewLink, 'text-xs')}>
            Read Full Review
            <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
