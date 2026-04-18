'use client';

/**
 * Props
 * ─────
 * eyebrow          ReactNode   — small label above the heading
 * heading          string      — page title ("Watchlist" | "Watched")
 * count            string      — formatted count string
 * addLabel         string      — primary action button label
 * onAdd            () => void  — primary action handler
 * search           string
 * onSearchChange   (v: string) => void
 * searchPlaceholder string     — defaults to "Search…"
 * genre            string | null
 * onGenreChange    (v: string | null) => void
 * genreOptions     { value: string; label: string }[]
 * isEmpty          boolean     — is the filtered list empty?
 * hasFilters       boolean     — are any search/genre filters active?
 * emptyIcon        ReactNode   — icon shown in the empty state
 * emptyTitle       string
 * emptyText        string
 * emptyActionLabel string      — CTA label shown only when !hasFilters
 * showLoadMore     boolean     — render the Load More button below the grid?
 * loadMoreLabel    string      — button label, e.g. "Load 12 more"
 * onLoadMore       () => void  — Load More click handler
 * children         ReactNode   — the rendered movie cards
 */

import clsx from 'clsx';
import { Plus, Search, Filter } from 'lucide-react';

import Dropdown from '@/components/ui/dropdown/Dropdown';
import Input from '@/components/ui/input/Input';

import styles from './MovieListPage.module.css';

export default function MovieListPage({
  eyebrow,
  heading,
  count,
  addLabel,
  onAdd,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  genre,
  onGenreChange,
  genreOptions,
  isEmpty,
  hasFilters,
  emptyIcon,
  emptyTitle,
  emptyText,
  emptyActionLabel,
  showLoadMore = false,
  loadMoreLabel = 'Load more',
  onLoadMore,
  children,
}) {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <span className={clsx(styles.eyebrow, 'text-micro')}>{eyebrow}</span>

          <h1 className={styles.heading}>{heading}</h1>

          <p className={styles.count}>{count}</p>
        </div>

        <button type="button" className={clsx(styles.addBtn, 'text-xs')} onClick={onAdd}>
          <Plus size={16} />
          {addLabel}
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Input
            variant="filled"
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            prefixIcon={<Search size={18} />}
            showClear={false}
          />
        </div>
        <div className={styles.dropdownWrap}>
          <Dropdown
            options={genreOptions}
            value={genre}
            onChange={onGenreChange}
            placeholder="All Genres"
            icon={<Filter size={15} />}
          />
        </div>
      </div>

      {!isEmpty ? (
        <>
          <div className={styles.grid}>{children}</div>

          {showLoadMore && (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={clsx(styles.loadMoreBtn, 'text-xs')}
                onClick={onLoadMore}
              >
                {loadMoreLabel}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>{emptyIcon}</div>

          <h3 className={clsx(styles.emptyTitle, 'h-2xl', 'italic')}>{emptyTitle}</h3>

          <p className={styles.emptyText}>{emptyText}</p>

          {!hasFilters && emptyActionLabel && (
            <button type="button" className={clsx(styles.emptyBtn, 'text-xs')} onClick={onAdd}>
              <Plus size={15} />
              {emptyActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
