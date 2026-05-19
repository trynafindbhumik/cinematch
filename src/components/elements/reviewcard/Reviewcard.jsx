'use client';

import clsx from 'clsx';
import { Star, ExternalLink, Pencil, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import fallbackPoster from '@/assets/fallbacks/imagePoster_Fallback.png';
import DeleteConfirmModal from '@/components/elements/reviewcard/reviewModal/deleteConfirmModal/DeleteConfirmModal';
import EditReviewModal from '@/components/elements/reviewcard/reviewModal/editReviewModal/EditReviewModal';
import ReviewModal from '@/components/elements/reviewcard/reviewModal/ReviewModal';
import { useUpdateReview, useDeleteReview } from '@/hooks/useReviews';
import { useToast } from '@/lib/toast/useToast';

import styles from './Reviewcard.module.css';

export default function ReviewCard({
  review,
  showStars = false,
  showActions = true,
  onUpdated,
  onDeleted,
}) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { updateReview, loading: isUpdating } = useUpdateReview();
  const { deleteReview, loading: isDeleting } = useDeleteReview();

  const [activeModal, setActiveModal] = useState(null);
  const [posterError, setPosterError] = useState(false);

  const openView = () => setActiveModal('view');
  const closeAll = () => setActiveModal(null);

  const handleGoToMovie = (e) => {
    e.stopPropagation();
    if (review.movieId) {
      router.push(`/movie/${review.movieId}`);
    }
  };

  const handleSave = async (updated) => {
    try {
      await updateReview(updated.id, {
        comment: updated.comment,
        rating: updated.rating,
      });
      onUpdated?.(updated);
      closeAll();
      success('Review updated', 'Your changes have been saved');
    } catch (err) {
      showError('Failed', err?.message || 'Could not update review');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReview(review.id);
      onDeleted?.(review.id);
      closeAll();
      success('Review deleted', 'Your review has been removed');
    } catch (err) {
      showError('Failed', err?.message || 'Could not delete review');
    }
  };

  const isLoading = isUpdating || isDeleting;

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
            {review.moviePoster && !posterError ? (
              <Image
                src={review.moviePoster}
                alt={`${review.movieTitle} poster`}
                width={88}
                height={128}
                referrerPolicy="no-referrer"
                onError={() => setPosterError(true)}
                unoptimized
              />
            ) : (
              <Image
                src={fallbackPoster}
                alt={`${review.movieTitle || 'Movie'} poster`}
                width={88}
                height={128}
                referrerPolicy="no-referrer"
              />
            )}
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

          {showActions && (
            <div className={styles.reviewActions} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setActiveModal('edit')}
                disabled={isLoading}
                aria-label="Edit review"
              >
                {isUpdating ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <Pencil size={14} />
                )}
              </button>
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.actionBtnDelete)}
                onClick={() => setActiveModal('delete')}
                disabled={isLoading}
                aria-label="Delete review"
              >
                {isDeleting ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          )}
        </div>
      </article>

      {activeModal === 'view' && (
        <ReviewModal
          review={review}
          onClose={closeAll}
          onEdit={() => setActiveModal('edit')}
          onDelete={() => setActiveModal('delete')}
        />
      )}

      {activeModal === 'edit' && (
        <EditReviewModal review={review} onClose={closeAll} onSave={handleSave} />
      )}

      {activeModal === 'delete' && (
        <DeleteConfirmModal review={review} onClose={closeAll} onConfirm={handleConfirmDelete} />
      )}
    </>
  );
}
