'use client';

import clsx from 'clsx';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './DeleteConfirmModal.module.css';

export default function DeleteConfirmModal({ review, onClose, onConfirm }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
  };

  const handleSheetAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (typeof window === 'undefined') return null;
  if (!review) return null;

  const modal = (
    <div
      className={clsx(styles.backdrop, isClosing && styles.backdropClosing)}
      onClick={handleBackdropClick}
    >
      <div
        className={clsx(styles.modal, isClosing && styles.modalClosing)}
        onAnimationEnd={handleSheetAnimationEnd}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Cancel deletion"
        >
          <X size={16} />
        </button>

        <div className={styles.header}>
          <div className={styles.dangerIconWrap}>
            <AlertTriangle size={20} />
          </div>
          <h2 className={clsx('h-2xl', styles.title)}>Delete Review?</h2>
          <p className={clsx('text-sm', styles.subtitle)}>
            Are you sure you want to delete your review for <strong>{review.movieTitle}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className={styles.reviewPreview}>
          <blockquote className={styles.previewQuote}>&ldquo;{review.comment}&rdquo;</blockquote>
          <div className={styles.previewMeta}>
            <span className={styles.previewStars}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>
                  ★
                </span>
              ))}
            </span>
            <span className={styles.previewDate}>{review.date}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={clsx('text-sm', styles.cancelBtn)} onClick={handleClose}>
            Keep Review
          </button>
          <button
            type="button"
            className={clsx('text-sm', styles.deleteBtn)}
            onClick={handleConfirm}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
