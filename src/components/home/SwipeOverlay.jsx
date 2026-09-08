'use client';

import { Heart, ThumbsUp, ThumbsDown, Skull, X } from 'lucide-react';

import styles from './Home.module.css';

const OVERLAY_CONFIG = {
  like: { label: 'LIKE', Icon: ThumbsUp, className: styles.overlayLike },
  love: { label: 'LOVE', Icon: Heart, className: styles.overlayLove },
  dislike: { label: 'DISLIKE', Icon: ThumbsDown, className: styles.overlayDislike },
  skip: { label: 'SKIP', Icon: X, className: styles.overlaySkip },
  hate: { label: 'HATE', Icon: Skull, className: styles.overlayHate },
};

export default function SwipeOverlay({ type }) {
  if (!type || !OVERLAY_CONFIG[type]) return null;

  const { label, Icon, className } = OVERLAY_CONFIG[type];

  return (
    <div className={`${styles.badgeOverlay} ${className}`}>
      <Icon size={36} strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
}
