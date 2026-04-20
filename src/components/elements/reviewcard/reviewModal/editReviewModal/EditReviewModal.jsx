'use client';

import clsx from 'clsx';
import { Star, X, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './EditReviewModal.module.css';

function StarPicker({ value, onChange }) {
  return (
    <div className={styles.starPicker} role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={clsx(styles.starBtn, i <= value && styles.starBtnActive)}
          onClick={() => onChange(i)}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
          aria-pressed={i <= value}
        >
          <Star size={20} className={i <= value ? styles.starFilled : styles.starEmpty} />
        </button>
      ))}
    </div>
  );
}

export default function EditReviewModal({ review, onClose, onSave }) {
  const [comment, setComment] = useState(review?.comment ?? '');
  const [rating, setRating] = useState(review?.rating ?? 0);
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

  const handleSave = () => {
    if (!comment.trim() || rating === 0) return;
    onSave?.({ ...review, comment: comment.trim(), rating });
    onClose();
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
          aria-label="Cancel editing"
        >
          <X size={16} />
        </button>

        <div className={styles.header}>
          <div className={styles.editIconWrap}>
            <Edit2 size={18} />
          </div>
          <h2 className={clsx('h-2xl', styles.title)}>Edit Review</h2>
          <p className={clsx('text-sm', styles.subtitle)}>{review.movieTitle}</p>
        </div>

        <div className={styles.field}>
          <label className={clsx('text-micro', styles.label)} htmlFor="review-comment">
            Your Review
          </label>
          <textarea
            id="review-comment"
            className={styles.textarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your thoughts about this film…"
            rows={4}
            maxLength={500}
          />
          <span className={clsx('text-micro', styles.charCount)}>{comment.length}/500</span>
        </div>

        <div className={styles.field}>
          <label className={clsx('text-micro', styles.label)}>Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div className={styles.actions}>
          <button type="button" className={clsx('text-sm', styles.cancelBtn)} onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className={clsx('text-sm', styles.saveBtn)}
            onClick={handleSave}
            disabled={!comment.trim() || rating === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
