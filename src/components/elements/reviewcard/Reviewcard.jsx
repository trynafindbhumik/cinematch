'use client';

import clsx from 'clsx';
import { Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import styles from './Reviewcard.module.css';

export default function ReviewCard({ review, showStars = false, onClick }) {
  const router = useRouter();

  const handleGoToMovie = (e) => {
    e.stopPropagation();
    if (review.movieId) {
      router.push(`/movie/${review.movieId}`);
    }
  };

  return (
    <article
      className={styles.reviewCard}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
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

          <button type="button" className={clsx('text-micro', styles.reviewLink)}>
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
  );
}
