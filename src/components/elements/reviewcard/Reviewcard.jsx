'use client';

import clsx from 'clsx';
import { Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import DeleteConfirmModal from '@/components/elements/reviewcard/reviewModal/deleteConfirmModal/DeleteConfirmModal';
import EditReviewModal from '@/components/elements/reviewcard/reviewModal/editReviewModal/EditReviewModal';
import ReviewModal from '@/components/elements/reviewcard/reviewModal/ReviewModal';

import styles from './Reviewcard.module.css';

export default function ReviewCard({ review, showStars = false, onSave, onDelete }) {
  const router = useRouter();

  const [activeModal, setActiveModal] = useState(null);

  const openView = () => setActiveModal('view');
  const closeAll = () => setActiveModal(null);

  const handleGoToMovie = (e) => {
    e.stopPropagation();
    if (review.movieId) {
      router.push(`/movie/${review.movieId}`);
    }
  };

  const handleSave = (updated) => {
    onSave?.(updated);
    closeAll();
  };

  const handleConfirmDelete = () => {
    onDelete?.(review.id);
    closeAll();
  };

  return (
    <>
      <article
        className={styles.reviewCard}
        role="button"
        tabIndex={0}
        aria-label={`View full review for ${review.movieTitle}`}
        onClick={openView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openView();
          }
        }}
      >
        <div className={styles.reviewCardInner}>
          <div className={styles.reviewPoster}>
            <Image
              src={review.moviePoster}
              alt={`${review.movieTitle} poster`}
              width={72}
              height={104}
              referrerPolicy="no-referrer"
            />
          </div>

          <div className={styles.reviewContent}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewMeta}>
                <h4 className={clsx('h-md', styles.reviewTitle)}>{review.movieTitle}</h4>
                <p className={styles.reviewDate}>{review.date}</p>
              </div>

              <div className={styles.reviewRating} aria-label={`Rated ${review.rating} out of 5`}>
                <Star className={styles.reviewRatingIcon} aria-hidden="true" />
                <span className={styles.reviewRatingText}>{review.rating}</span>
              </div>
            </div>

            {showStars && (
              <div
                className={styles.starRow}
                role="img"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={i <= review.rating ? styles.starFilled : styles.starEmpty}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            <p className={styles.reviewComment}>&ldquo;{review.comment}&rdquo;</p>

            <button
              type="button"
              className={clsx('text-micro', styles.reviewLink)}
              onClick={(e) => {
                e.stopPropagation();
                openView();
              }}
            >
              Read Full Review
              <ExternalLink size={10} aria-hidden="true" />
            </button>

            {review.movieId && (
              <button
                type="button"
                className={clsx('text-micro', styles.movieLink)}
                onClick={handleGoToMovie}
                aria-label={`Go to movie page for ${review.movieTitle}`}
              >
                Go to Movie
                <ExternalLink size={10} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </article>

      {activeModal === 'view' && (
        <ReviewModal
          review={review}
          onClose={closeAll}
          onEdit={onSave ? () => setActiveModal('edit') : undefined}
          onDelete={onDelete ? () => setActiveModal('delete') : undefined}
        />
      )}

      {activeModal === 'edit' && (
        <EditReviewModal
          review={review}
          onClose={() => setActiveModal('view')}
          onSave={handleSave}
        />
      )}

      {activeModal === 'delete' && (
        <DeleteConfirmModal
          review={review}
          onClose={() => setActiveModal('view')}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
