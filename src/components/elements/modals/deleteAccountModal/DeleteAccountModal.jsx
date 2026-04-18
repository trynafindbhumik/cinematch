'use client';

import clsx from 'clsx';
import { AlertTriangle, Download, Lock, Check, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/ui/checkbox/Checkbox';
import Dropdown from '@/components/ui/dropdown/Dropdown';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

import sharedStyles from '../Modals.module.css';

import styles from './DeleteAccountModal.module.css';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const [step, setStep] = useState('warn');
  const [confirmText, setConfirmText] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [disableConfirmText, setDisableConfirmText] = useState('');
  const [disableDuration, setDisableDuration] = useState('30');

  const router = useRouter();
  const { sheetRef, dragHandleRef } = useSwipeToClose(onClose, isOpen);

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
        setDisableConfirmText('');
        setDisableDuration('30');
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const canProceedToConfirm = agreed && confirmText === 'DELETE';

  const handleFinalDelete = () => {
    if (!canProceedToConfirm) return;
    handleClose();
  };

  const canProceedToDisable = disableConfirmText === 'DISABLE';

  const handleDisableAccount = () => {
    if (!canProceedToDisable) return;
    setStep('disabled');
  };

  const handleDoneDisable = () => {
    handleClose();
    setTimeout(() => {
      router.push('/login');
    }, 300);
  };

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={sharedStyles.sheet} style={{ maxWidth: '30rem' }} ref={sheetRef}>
        <div className={sharedStyles.mobileHandle} ref={dragHandleRef} aria-hidden="true" />

        {step === 'warn' && (
          <>
            <div className={styles.deleteHeader}>
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
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.disableBtn}
                  onClick={() => setStep('disable-confirm')}
                >
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
            <div className={styles.deleteHeader}>
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

              <div className={styles.checkboxWrap}>
                <Checkbox
                  checked={agreed}
                  onChange={setAgreed}
                  variant="danger"
                  alignItems="flex-start"
                  labelClass={styles.checkboxLabel}
                  label={
                    <>
                      I understand this will <strong>permanently delete</strong> all my data and
                      this action cannot be undone.
                    </>
                  }
                />
              </div>
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

        {step === 'disable-confirm' && (
          <>
            <div className={styles.deleteHeader}>
              <div className={clsx(styles.dangerIconWrap, sharedStyles.headerIcon)}>
                <Moon size={22} />
              </div>
              <div className={sharedStyles.headerText}>
                <h2 className={clsx('h-3xl', sharedStyles.title)}>Temporarily Disable</h2>
                <p className={sharedStyles.subtitle}>Choose how long to hide your account.</p>
              </div>
            </div>

            <div className={sharedStyles.body}>
              <p className={styles.confirmIntro}>
                Your account will be <strong>temporarily hidden</strong> and cannot be accessed. You
                can reactivate it anytime by logging back in. After the selected period, your
                account and all data will be permanently deleted.
              </p>

              <div className={styles.durationSelector}>
                <Dropdown
                  label="Disable for:"
                  options={[
                    { value: '7', label: '1 Week' },
                    { value: '14', label: '2 Weeks' },
                    { value: '30', label: '1 Month' },
                    { value: '90', label: '3 Months' },
                  ]}
                  value={disableDuration}
                  onChange={(val) => setDisableDuration(val || '30')}
                  placeholder="Select duration"
                />
              </div>

              <div className={styles.disableInfoBox}>
                <ul className={styles.disableInfoList}>
                  <li>
                    <Check size={13} className={styles.checkIcon} />
                    Your watchlist and history will be saved
                  </li>
                  <li>
                    <Check size={13} className={styles.checkIcon} />
                    No one can see your profile or ratings
                  </li>
                  <li>
                    <Check size={13} className={styles.checkIcon} />
                    You can reactivate by simply logging in
                  </li>
                </ul>
              </div>

              <div className={styles.confirmInputWrap}>
                <p className={styles.confirmIntro}>
                  To confirm account disabling, type <strong>DISABLE</strong> below and check the
                  box:
                </p>
                <input
                  type="text"
                  className={styles.confirmInput}
                  placeholder="Type DISABLE"
                  value={disableConfirmText}
                  onChange={(e) => setDisableConfirmText(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className={sharedStyles.footer}>
              <div className={styles.actionRow}>
                <button type="button" className={styles.cancelBtn} onClick={() => setStep('warn')}>
                  Back
                </button>
                <button
                  type="button"
                  className={styles.disableAccountBtn}
                  onClick={handleDisableAccount}
                  disabled={!canProceedToDisable}
                >
                  Disable Account
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'disabled' && (
          <>
            <div className={styles.deleteHeader}>
              <div className={clsx(styles.dangerIconWrap, sharedStyles.headerIcon)}>
                <Moon size={22} />
              </div>
              <div className={sharedStyles.headerText}>
                <h2 className={clsx('h-3xl', sharedStyles.title)}>Account Disabled</h2>
                <p className={sharedStyles.subtitle}>See you again soon!</p>
              </div>
            </div>

            <div className={sharedStyles.body}>
              <div className={styles.successBox}>
                <p className={styles.successText}>
                  Your account has been <strong>temporarily disabled</strong> for{' '}
                  <strong>
                    {disableDuration === '7'
                      ? '1 week'
                      : disableDuration === '14'
                        ? '2 weeks'
                        : disableDuration === '30'
                          ? '1 month'
                          : '3 months'}
                  </strong>
                  . Log back in anytime to reactivate. After this period, all data will be
                  permanently deleted.
                </p>
              </div>

              <div className={styles.reactivateBox}>
                <p className={styles.reactivateText}>
                  To reactivate, simply <strong>log in</strong> before the period ends. Your data
                  will be restored automatically.
                </p>
              </div>
            </div>

            <div className={sharedStyles.footer}>
              <div className={styles.actionRow}>
                <button type="button" className={styles.doneBtn} onClick={handleDoneDisable}>
                  Done
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
