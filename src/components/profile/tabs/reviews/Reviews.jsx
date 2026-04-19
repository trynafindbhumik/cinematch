'use client';

import clsx from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';

import ReviewCard from '@/components/elements/reviewcard/Reviewcard';
import DateRangePicker from '@/components/ui/dateRangePicker/DateRangePicker';
import { MOCK_REVIEWS } from '@/mocks/data';

import styles from './Reviews.module.css';

const PAGE_SIZE = 6;

function parseReviewDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw) ? null : raw;
  const d = new Date(raw);
  return isNaN(d) ? null : d;
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const filteredReviews = useMemo(() => {
    if (!dateFrom && !dateTo) return MOCK_REVIEWS;

    return MOCK_REVIEWS.filter((review) => {
      const reviewDate = parseReviewDate(review.date);
      if (!reviewDate) return true;

      const d = reviewDate.getTime();

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (d < from.getTime()) return false;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (d > to.getTime()) return false;
      }

      return true;
    });
  }, [dateFrom, dateTo]);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;
  const remaining = filteredReviews.length - visibleCount;
  const hasFilter = dateFrom || dateTo;

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

      <div className={styles.filterBar}>
        <span className={clsx(styles.filterLabel, 'text-micro')}>
          <SlidersHorizontal size={10} aria-hidden="true" />
          Filter by date
        </span>

        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={({ from, to }) => {
            setDateFrom(from ?? null);
            setDateTo(to ?? null);
            setVisibleCount(PAGE_SIZE);
          }}
          onClear={() => {
            setDateFrom(null);
            setDateTo(null);
            setVisibleCount(PAGE_SIZE); 
          }}
        />

        {hasFilter && (
          <span className={clsx(styles.filterCount, 'text-micro')}>
            {filteredReviews.length} of {MOCK_REVIEWS.length}
          </span>
        )}
      </div>

      <div className={styles.reviewsGrid}>
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review, index) => (
            <div
              key={review.id}
              className={styles.reviewItem}
              style={{ '--item-index': index % PAGE_SIZE }}
            >
              <ReviewCard review={review} showStars />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">✦</span>
            <p className={clsx(styles.emptyTitle, 'text-sm')}>No reviews found</p>
            <p className={clsx(styles.emptySubtitle, 'text-xs')}>
              Try adjusting your date range.
            </p>
          </div>
        )}
      </div>

      {filteredReviews.length > 0 && (
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
              You&apos;ve seen all {filteredReviews.length} review
              {filteredReviews.length !== 1 ? 's' : ''}
              {hasFilter ? ' matching this range' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}