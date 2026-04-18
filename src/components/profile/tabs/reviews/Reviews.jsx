'use client';

import clsx from 'clsx';
import { useState } from 'react';

import ReviewCard from '@/components/elements/reviewcard/Reviewcard';
import { MOCK_REVIEWS } from '@/mocks/data';

import styles from './Reviews.module.css';

const PAGE_SIZE = 6;

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const visibleReviews = MOCK_REVIEWS.slice(0, visibleCount);
  const hasMore = visibleCount < MOCK_REVIEWS.length;
  const remaining = MOCK_REVIEWS.length - visibleCount;

  const handleLoadMore = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setVisibleCount((prev) => prev + PAGE_SIZE);
    setIsLoading(false);
  };

  return (
    <div className={styles.tabWrap}>
      <h1 className={styles.heading}>Reviews</h1>

      <p className={clsx(styles.tabSubtitle, 'italic')}>Your personal film journal.</p>

      <div className={styles.reviewsGrid}>
        {visibleReviews.map((review, index) => (
          <div
            key={review.id}
            className={styles.reviewItem}
            style={{ '--item-index': index % PAGE_SIZE }}
          >
            <ReviewCard review={review} showStars />
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        {hasMore ? (
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Loading…
              </>
            ) : (
              <>
                Load {Math.min(remaining, PAGE_SIZE)} more
                <span className={styles.loadMoreCount}>{remaining} remaining</span>
              </>
            )}
          </button>
        ) : (
          <p className={styles.endMessage}>
            <span className={styles.endIcon}>✦</span>
            You&apos;ve seen all {MOCK_REVIEWS.length} reviews
          </p>
        )}
      </div>
    </div>
  );
}
