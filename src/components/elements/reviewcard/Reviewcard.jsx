'use client';

import clsx from 'clsx';
import { Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';

import styles from './Reviewcard.module.css';

export default function ReviewCard({ review, showStars = false }) {
  return (
    <article className={styles.reviewCard}>
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
        </div>
      </div>
    </article>
  );
}
