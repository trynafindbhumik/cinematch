'use client';

import clsx from 'clsx';
import { X, Search, CheckCircle2, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { OTTS, OTT_COLORS } from '@/mocks/data';

import sharedStyles from '../Modals.module.css';

import styles from './OttModal.module.css';

/**
 * OttModal — streaming service selector
 * Rendered via React Portal so it always covers the full viewport.
 *
 * Props:
 *  - isOpen         : boolean
 *  - onClose        : () => void
 *  - selectedOtts   : string[]
 *  - onToggleOtt    : (name: string) => void
 */
export default function OttModal({ isOpen, onClose, selectedOtts = [], onToggleOtt }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;
  if (!isOpen) return null;

  const filtered = OTTS.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={clsx(sharedStyles.mobileHandle, styles.mobileHandle)} />
      <div className={clsx(sharedStyles.sheet, styles.ottSheet)}>
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
            value={search}
            onChange={setSearch}
            placeholder="Search services…"
            prefixIcon={<Search size={18} />}
          />
        </div>

        <div className={sharedStyles.body}>
          <div className={styles.ottGrid}>
            {filtered.map((ott) => {
              const isSelected = selectedOtts.includes(ott);
              const color = OTT_COLORS[ott] || '#8c7851';

              return (
                <button
                  key={ott}
                  type="button"
                  className={clsx(styles.ottCard, isSelected && styles.ottCardSelected)}
                  onClick={() => onToggleOtt(ott)}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <div className={styles.ottCheckBadge}>
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                  <div
                    className={styles.ottIcon}
                    style={isSelected ? { background: color } : undefined}
                  >
                    <Globe size={20} />
                  </div>
                  <span className={clsx('text-xs', styles.ottLabel)}>{ott}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={sharedStyles.footer}>
          <button type="button" className={styles.btnFullPrimary} onClick={onClose}>
            Done — {selectedOtts.length} selected
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
