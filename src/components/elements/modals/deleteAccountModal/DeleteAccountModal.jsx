'use client';

import clsx from 'clsx';
import { AlertTriangle, Download, Lock, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Button from '@/components/ui/button/Button';

import sharedStyles from '../Modals.module.css';

import styles from './DeleteAccountModal.module.css';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const [step, setStep] = useState('warn'); // 'warn' | 'confirm'
  const [confirmText, setConfirmText] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep('warn');
        setConfirmText('');
        setAgreed(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const canProceedToConfirm = agreed && confirmText === 'DELETE';

  const handleFinalDelete = () => {
    if (!canProceedToConfirm) return;
    // TODO: wire up delete account API call here
    handleClose();
  };

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={sharedStyles.sheet} style={{ maxWidth: '30rem' }}>
        <div className={clsx(sharedStyles.mobileHandle, styles.mobileHandle)} />

        {step === 'warn' && (
          <>
            <div className={sharedStyles.header}>
              <div className={clsx(styles.dangerIconWrap, sharedStyles.headerIcon)}>
                <AlertTriangle size={22} />
              </div>
              <div className={sharedStyles.headerText}>
                <h2 className={clsx('h-3xl', sharedStyles.title)}>Delete Account</h2>
                <p className={sharedStyles.subtitle}>This action cannot be undone.</p>
              </div>
            </div>

            <div className={sharedStyles.body}>
              <p className={styles.warningText}>
                Your account and all associated data will be <strong>permanently deleted</strong>.
                This includes:
              </p>

              <ul className={styles.consequenceList}>
                {[
                  'Your watchlist and viewing history',
                  'All movie ratings and reviews',
                  'Preferred genres and streaming services',
                  'Saved preferences and settings',
                  'Profile information and avatar',
                ].map((item) => (
                  <li key={item} className={styles.consequenceItem}>
                    <Check size={13} className={styles.checkIcon} />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={styles.exportBanner}>
                <Download size={16} className={styles.exportIcon} />
                <p className={styles.exportText}>
                  <strong>Tip:</strong> You can{' '}
                  <button type="button" className={styles.exportLink}>
                    download your data
                  </button>{' '}
                  before deleting your account.
                </p>
              </div>

              <div className={styles.alternative}>
                <p className={styles.alternativeLabel}>Instead of deleting, you could:</p>
                <Button variant="secondary" size="sm" className={styles.disableBtn}>
                  Temporarily Disable Account
                </Button>
              </div>
            </div>

            <div className={sharedStyles.footer}>
              <div className={styles.actionRow}>
                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                  Cancel
                </button>
                <button type="button" className={styles.nextBtn} onClick={() => setStep('confirm')}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className={sharedStyles.header}>
              <div className={clsx(styles.dangerIconWrap, sharedStyles.headerIcon)}>
                <Lock size={22} />
              </div>
              <div className={sharedStyles.headerText}>
                <h2 className={clsx('h-3xl', sharedStyles.title)}>Final Confirmation</h2>
                <p className={sharedStyles.subtitle}>Please verify to proceed.</p>
              </div>
            </div>

            <div className={sharedStyles.body}>
              <p className={styles.confirmIntro}>
                To confirm account deletion, type <strong>DELETE</strong> below and check the box:
              </p>

              <div className={styles.confirmInputWrap}>
                <input
                  type="text"
                  className={styles.confirmInput}
                  placeholder="Type DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <label className={styles.checkboxLabel}>
                <span className={clsx(styles.checkbox, agreed && styles.checkboxChecked)}>
                  {agreed && <Check size={11} />}
                </span>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  I understand this will <strong>permanently delete</strong> all my data and this
                  action cannot be undone.
                </span>
              </label>
            </div>

            <div className={sharedStyles.footer}>
              <div className={styles.actionRow}>
                <button type="button" className={styles.cancelBtn} onClick={() => setStep('warn')}>
                  Back
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={handleFinalDelete}
                  disabled={!canProceedToConfirm}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
