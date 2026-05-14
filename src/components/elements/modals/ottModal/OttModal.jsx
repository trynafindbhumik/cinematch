'use client';

import clsx from 'clsx';
import { X, Search, CheckCircle2, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { useModal } from '@/context/ModalContext';
import { useStreamingServicesPaginated, useStreamingServicesSearch } from '@/hooks/useStreaming';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { useToast } from '@/lib/toast/useToast';

import sharedStyles from '../Modals.module.css';

import styles from './OttModal.module.css';

/**
 * Props:
 *  - isOpen         : boolean
 *  - onClose        : () => void
 *  - selectedServices : StreamingService[]
 *  - onSave         : (serviceIds: number[]) => void | Promise
 */
export default function OttModal({ isOpen, onClose, selectedServices = [], onSave }) {
  const [saving, setSaving] = useState(false);

  // Hooks for fetching services
  const {
    services,
    hasMore,
    loading: isInitialLoading,
    fetchNextPage: fetchMoreServices,
    isFetchingMore: isLoadingMore,
  } = useStreamingServicesPaginated({ enabled: isOpen });

  const {
    results,
    hasMore: searchHasMore,
    loading: isSearchingInitial,
    fetchNextPage: fetchMoreSearch,
    setQuery: handleSearch,
    query: searchQuery,
  } = useStreamingServicesSearch('', { enabled: isOpen });

  // Local state for selections
  const [localSelectedIds, setLocalSelectedIds] = useState(() =>
    selectedServices.map((s) => s.id || s.sourceId)
  );

  const { openModal, closeModal } = useModal();
  const { success } = useToast();

  // Load more ref for triggering pagination
  const loadMoreRef = useRef(null);
  const isModalOpenRef = useRef(false);

  const [initialSelectedIds, setInitialSelectedIds] = useState(() =>
    selectedServices.map((s) => s.id || s.sourceId).sort()
  );

  const previousIsOpenRef = useRef(isOpen);

  const { sheetRef, dragHandleRef } = useSwipeToClose(onClose, isOpen);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && !isModalOpenRef.current) {
      isModalOpenRef.current = true;

      setInitialSelectedIds([...selectedServices.map((s) => s.id || s.sourceId)].sort());
      setLocalSelectedIds(selectedServices.map((s) => s.id || s.sourceId));
    }

    if (!isOpen) {
      isModalOpenRef.current = false;
    }
  }, [isOpen, selectedServices]);

  // Cleanup search when modal closes
  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (wasOpen && !isOpen) {
      queueMicrotask(() => {
        handleSearch('');
      });
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen, handleSearch]);

  // Infinite scroll using scroll event on body
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const isSearchMode = Boolean(searchQuery);
    const canLoad = isSearchMode ? searchHasMore : hasMore;

    const bodyEl = document.querySelector(`.${sharedStyles.body}`);

    if (!bodyEl) {
      return undefined;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = bodyEl;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (canLoad && !isLoadingMore) {
          if (isSearchMode) {
            fetchMoreSearch();
          } else {
            fetchMoreServices();
          }
        }
      }
    };

    bodyEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      bodyEl.removeEventListener('scroll', handleScroll);
    };
  }, [
    isOpen,
    searchQuery,
    searchHasMore,
    hasMore,
    isLoadingMore,
    fetchMoreSearch,
    fetchMoreServices,
  ]);

  useEffect(() => {
    if (isOpen) {
      openModal();
    }

    return () => {
      closeModal();
    };
  }, [isOpen, openModal, closeModal]);

  const hasChanges = (() => {
    const sortedLocal = [...localSelectedIds].sort();
    return JSON.stringify(sortedLocal) !== JSON.stringify(initialSelectedIds);
  })();

  if (!isOpen) {
    return null;
  }

  // Use search results if available
  const displayServices = searchQuery ? results : services;

  const isShowingSearch = Boolean(searchQuery);

  // Append skeleton items to display during loading more
  const displayItems = isLoadingMore
    ? [
        ...displayServices,
        { id: 'skeleton-1' },
        { id: 'skeleton-2' },
        { id: 'skeleton-3' },
        { id: 'skeleton-4' },
        { id: 'skeleton-5' },
        { id: 'skeleton-6' },
        { id: 'skeleton-7' },
        { id: 'skeleton-8' },
      ]
    : displayServices;

  // Determine if we should show initial loading (first load only)
  const isInitialLoad = isInitialLoading || (isShowingSearch && isSearchingInitial);
  const showInitialLoading = isInitialLoad && displayServices.length === 0;
  const showEmptyState = !showInitialLoading && displayServices.length === 0;

  const handleToggle = (service) => {
    setLocalSelectedIds((prev) => {
      const isSelected = prev.includes(service.id);

      if (isSelected) {
        return prev.filter((id) => id !== service.id);
      }

      return [...prev, service.id];
    });
  };

  const handleSave = async () => {
    if (!hasChanges || saving) {
      return;
    }

    setSaving(true);

    try {
      await onSave?.(localSelectedIds);
      success('Preferences saved', 'Your streaming services have been updated');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const canLoadMore = isShowingSearch ? searchHasMore : hasMore;

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={clsx(sharedStyles.sheet, styles.ottSheet)} ref={sheetRef}>
        <div className={sharedStyles.mobileHandle} ref={dragHandleRef} aria-hidden="true" />

        <div className={sharedStyles.header}>
          <div className={sharedStyles.headerText}>
            <h2 className={clsx('h-3xl', sharedStyles.title)}>Streaming Services</h2>

            <p className={sharedStyles.subtitle}>
              Pick the platforms you use — we&apos;ll tailor every suggestion.
            </p>
          </div>

          <button
            type="button"
            className={sharedStyles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.searchBar}>
          <Input
            variant="filled"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search services…"
            prefixIcon={<Search size={18} />}
          />
        </div>

        <div className={sharedStyles.body}>
          {showInitialLoading ? (
            // Initial loading state
            <div className={styles.loadingGrid}>
              {[
                'loading-1',
                'loading-2',
                'loading-3',
                'loading-4',
                'loading-5',
                'loading-6',
                'loading-7',
                'loading-8',
              ].map((key) => (
                <div key={key} className={styles.loadingCard}>
                  <div className={styles.loadingIcon} />
                  <div className={styles.loadingLabel} />
                </div>
              ))}
            </div>
          ) : showEmptyState ? (
            // Empty state
            <div className={styles.emptyState}>
              <Globe size={32} className={styles.emptyIcon} />
              <p>No services found</p>
            </div>
          ) : (
            <>
              {/* Services grid */}
              <div className={styles.ottGrid}>
                {displayItems.map((service) => {
                  const isSelected = localSelectedIds.includes(service.id);
                  const isSkeleton = service.id?.toString().startsWith('skeleton-');

                  return (
                    <button
                      key={service.id}
                      type="button"
                      className={clsx(
                        styles.ottCard,
                        isSkeleton && styles.ottCardSkeleton,
                        isSelected && !isSkeleton && styles.ottCardSelected
                      )}
                      disabled={isSkeleton || saving}
                      aria-pressed={isSelected}
                      onClick={isSkeleton ? undefined : () => handleToggle(service)}
                    >
                      {isSelected && !isSkeleton && (
                        <div className={styles.ottCheckBadge}>
                          <CheckCircle2 size={10} />
                        </div>
                      )}

                      <div className={clsx(styles.ottIcon, isSkeleton && styles.ottIconSkeleton)} />

                      <span
                        className={clsx(
                          'text-xs',
                          styles.ottLabel,
                          isSkeleton && styles.ottLabelSkeleton
                        )}
                      >
                        {isSkeleton ? '' : service.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                {!canLoadMore && displayServices.length > 0 && (
                  <span className={styles.endMessage}>No more services</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className={sharedStyles.footer}>
          <button
            type="button"
            className={styles.btnFullPrimary}
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving
              ? 'Saving…'
              : hasChanges
                ? `Done — ${localSelectedIds.length} selected`
                : 'No changes'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
