'use client';

import clsx from 'clsx';
import { X, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

import sharedStyles from '../Modals.module.css';

import styles from './ChangePasswordModal.module.css';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const { sheetRef, dragHandleRef } = useSwipeToClose(onClose, isOpen);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.current) errs.current = 'Current password is required.';
    if (!form.next) errs.next = 'New password is required.';
    else if (form.next.length < 8) errs.next = 'Must be at least 8 characters.';
    if (!form.confirm) errs.confirm = 'Please confirm your new password.';
    else if (form.confirm !== form.next) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const strength =
    form.next.length === 0
      ? 0
      : form.next.length < 6
        ? 1
        : form.next.length < 8
          ? 2
          : form.next.length < 12
            ? 3
            : 4;

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    '',
    'var(--color-error)',
    'var(--color-rating-yellow)',
    'var(--color-success)',
    'var(--color-like-green)',
  ];

  const modal = (
    <div className={sharedStyles.overlay} onClick={handleOverlayClick}>
      <div className={sharedStyles.sheet} ref={sheetRef}>
        <div
          className={sharedStyles.mobileHandle}
          ref={dragHandleRef}
          aria-hidden="true"
        />

        <div className={sharedStyles.header}>
          <div className={sharedStyles.headerText}>
            <h2 className={clsx('h-3xl', sharedStyles.title)}>Change Password</h2>
            <p className={sharedStyles.subtitle}>Enter your current and new password.</p>
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

        <div className={sharedStyles.body}>
          <form id="change-password-form" onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <div className={styles.passwordWrap}>
                <Input
                  variant="filled"
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.current}
                  onChange={handleChange('current')}
                  placeholder="Enter current password"
                  prefixIcon={<Lock size={18} />}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.current && (
                <span className={styles.fieldError}>
                  <AlertCircle size={12} /> {errors.current}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.passwordWrap}>
                <Input
                  variant="filled"
                  label="New Password"
                  type={showNext ? 'text' : 'password'}
                  value={form.next}
                  onChange={handleChange('next')}
                  placeholder="Enter new password"
                  prefixIcon={<Lock size={18} />}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNext((v) => !v)}
                  aria-label={showNext ? 'Hide new password' : 'Show new password'}
                >
                  {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.next && (
                <span className={styles.fieldError}>
                  <AlertCircle size={12} /> {errors.next}
                </span>
              )}
              {form.next && !errors.next && (
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength / 4) * 100}%`,
                      background: strengthColors[strength],
                    }}
                  />
                  <span
                    className={styles.strengthLabel}
                    style={{ color: strengthColors[strength] }}
                  >
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.passwordWrap}>
                <Input
                  variant="filled"
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  placeholder="Re-enter new password"
                  prefixIcon={<Lock size={18} />}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm && (
                <span className={styles.fieldError}>
                  <AlertCircle size={12} /> {errors.confirm}
                </span>
              )}
              {form.confirm && form.confirm === form.next && !errors.confirm && (
                <span className={styles.matchMsg}>
                  <Check size={12} /> Passwords match
                </span>
              )}
            </div>
          </form>
        </div>

        <div className={sharedStyles.footer}>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" form="change-password-form" className={styles.btnPrimary}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}