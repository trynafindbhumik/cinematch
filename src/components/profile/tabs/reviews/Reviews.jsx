'use client';

import clsx from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import ReviewCard from '@/components/elements/reviewcard/Reviewcard';
import DateRangePicker from '@/components/ui/dateRangePicker/DateRangePicker';
import { useInfiniteReviews, transformReviews } from '@/hooks/useReviews';

import styles from './Reviews.module.css';

export default function Reviews() {
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const {
    reviews: apiReviews,
    hasMore,
    loading,
    loadMoreRef,
  } = useInfiniteReviews({ dateFrom, dateTo });

  const reviews = useMemo(() => transformReviews(apiReviews), [apiReviews]);

  const handleDateChange = useCallback(({ from, to }) => {
    setDateFrom(from ?? null);
    setDateTo(to ?? null);
  }, []);

  const handleClearFilter = useCallback(() => {
    setDateFrom(null);
    setDateTo(null);
  }, []);

  const hasFilter = dateFrom || dateTo;
  const totalCount = reviews.length;

  const initialSkeletons = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: `review-skeleton-${index}`,
      })),
    []
  );

  return (
    <div className={styles.tabWrap}>
      <h1 className={styles.heading}>Reviews</h1>
      <p className={clsx(styles.tabSubtitle, 'italic')}>Your personal film journal.</p>

      <div className={styles.filterBar}>
        <span className={clsx(styles.filterLabel, 'text-micro')}>
          <SlidersHorizontal size={10} aria-hidden="true" />
          Filter by date
        </span>

        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={handleDateChange}
          onClear={handleClearFilter}
        />

        {hasFilter && (
          <span className={clsx(styles.filterCount, 'text-micro')}>
            {totalCount} review{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && reviews.length === 0 ? (
        <div className={styles.reviewsGrid}>
          {initialSkeletons.map((item) => (
            <div key={item.id} className={styles.reviewItem}>
              <div className={styles.reviewSkeletonCard}>
                <div className={styles.reviewSkeletonInner}>
                  <div className={styles.reviewSkeletonPoster} />
                  <div className={styles.reviewSkeletonContent}>
                    <div className={styles.reviewSkeletonLine} style={{ height: '18px' }}>
                      <div className={styles.reviewSkeletonLineWide} style={{ height: '18px' }} />
                    </div>
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '40%', marginTop: '8px' }}
                    />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '100%', marginTop: '12px' }}
                    />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '80%', marginTop: '6px' }}
                    />
                    <div
                      className={styles.reviewSkeletonLine}
                      style={{ width: '60%', marginTop: '6px' }}
                    />
                  </div>
                  <div className={styles.reviewSkeletonRating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            ✦
          </span>
          <p className={clsx(styles.emptyTitle, 'text-sm')}>No reviews found</p>
          <p className={clsx(styles.emptySubtitle, 'text-xs')}>
            {hasFilter
              ? 'Try adjusting your date range.'
              : 'Start watching movies to write your first review!'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.reviewsGrid}>
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={styles.reviewItem}
                data-animate={index < 10}
                style={{ '--item-index': index }}
              >
                <ReviewCard review={review} showStars />
              </div>
            ))}

            {loading && hasMore && (
              <>
                {Array.from({ length: 2 }, (_, index) => (
                  <div key={`loading-more-${index}`} className={styles.reviewItem}>
                    <div className={styles.reviewSkeletonCard}>
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
                            style={{ width: '40%', marginTop: '8px' }}
                          />
                        </div>
                        <div className={styles.reviewSkeletonRating} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div ref={loadMoreRef} className={styles.footer} style={{ minHeight: '60px' }}>
            {!hasMore && reviews.length > 0 && (
              <p className={styles.endMessage}>
                <span className={styles.endIcon}>✦</span>
                You&apos;ve seen all {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                {hasFilter ? ' matching this range' : ''}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
