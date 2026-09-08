'use client';

import { Heart, ThumbsUp, ThumbsDown, Skull, X } from 'lucide-react';

import styles from './Home.module.css';

const ACTIONS = [
  {
    id: 'hate',
    label: 'Hate',
    Icon: Skull,
    dir: 'left',
    overlayKey: 'hate',
    className: styles.hateBtn,
  },
  {
    id: 'dislike',
    label: 'Dislike',
    Icon: ThumbsDown,
    dir: 'left',
    overlayKey: 'dislike',
    className: styles.dislikeBtn,
  },
  {
    id: 'skip',
    label: 'Skip',
    Icon: X,
    dir: 'left',
    overlayKey: 'skip',
    className: styles.skipBtn,
  },
  {
    id: 'like',
    label: 'Like',
    Icon: ThumbsUp,
    dir: 'right',
    overlayKey: 'like',
    className: styles.likeBtn,
  },
  {
    id: 'love',
    label: 'Love',
    Icon: Heart,
    dir: 'right',
    overlayKey: 'love',
    className: styles.loveBtn,
  },
];

export default function SwipeControls({ onAction, disabled }) {
  return (
    <div className={styles.controlsRow}>
      {ACTIONS.map(({ id, label, Icon, dir, overlayKey, className }) => (
        <button
          key={id}
          className={`${styles.actionBtn} ${className}`}
          title={label}
          disabled={disabled}
          onClick={() => onAction(dir, overlayKey)}
        >
          <Icon size={22} />
        </button>
      ))}
    </div>
  );
}
