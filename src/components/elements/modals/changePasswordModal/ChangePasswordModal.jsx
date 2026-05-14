'use client';

import clsx from 'clsx';
import { X, Lock, Eye, EyeOff, AlertCircle, Check, LogOut } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import Toggle from '@/components/ui/toggle/Toggle';
import { useModal } from '@/context/ModalContext';
import { useChangePassword } from '@/hooks/useProfile';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { useToast } from '@/lib/toast/useToast';

import sharedStyles from '../Modals.module.css';

import styles from './ChangePasswordModal.module.css';

// Constants for form reset
const EMPTY_FORM = { current: '', next: '', confirm: '' };
const EMPTY_ERRORS = {};

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);
  const { openModal, closeModal } = useModal();
  const { success, error: showError } = useToast();

  // Keep ref to onClose to avoid closure issues
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // API mutation hook
  const [, loading, error, trigger] = useChangePassword({
    onSuccess: () => {
      success('Password changed', 'Your password has been updated');
      onCloseRef.current();
    },
  });

  const { sheetRef, dragHandleRef } = useSwipeToClose(onClose, isOpen);

  // Derive API error message
  const apiError = useMemo(
    () => (error ? error.message || 'Failed to change password. Please try again.' : ''),
    [error]
  );

  const previousIsOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (!wasOpen && isOpen) {
      queueMicrotask(() => {
        setForm(EMPTY_FORM);
        setErrors(EMPTY_ERRORS);
        setLogoutAllDevices(false);
      });
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) openModal();
    return () => closeModal();
  }, [isOpen, openModal, closeModal]);

  if (!isOpen) return null;

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.current) errs.current = 'Current password is required.';
    if (!form.next) errs.next = 'New password is required.';
    else if (form.next.length < 8) errs.next = 'Must be at least 8 characters.';
    if (!form.confirm) errs.confirm = 'Please confirm your new password.';
    else if (form.confirm !== form.next) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  // Form change handler
  const handleChange = (field) => (value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await trigger('/v1/profile/password', {
        oldPassword: form.current,
        newPassword: form.next,
        logoutFromAllDevices: logoutAllDevices,
      });
      // onClose is called via onSuccess callback in hook options
    } catch (err) {
      showError('Failed', err?.message || 'Could not change password. Please try again');
    }
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
        <div className={sharedStyles.mobileHandle} ref={dragHandleRef} aria-hidden="true" />

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
            {apiError && (
              <div className={styles.apiError}>
                <AlertCircle size={16} />
                <span>{apiError}</span>
              </div>
            )}

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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNext((v) => !v)}
                  aria-label={showNext ? 'Hide new password' : 'Show new password'}
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  disabled={loading}
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

            {/* Logout from all devices toggle */}
            <div className={styles.logoutToggle}>
              <div className={styles.logoutToggleInfo}>
                <div className={styles.logoutToggleIcon}>
                  <LogOut size={16} />
                </div>
                <div className={styles.logoutToggleText}>
                  <span className={styles.logoutToggleLabel}>Logout from all devices</span>
                  <span className={styles.logoutToggleDesc}>
                    Sign out from all other devices after changing password
                  </span>
                </div>
              </div>
              <Toggle checked={logoutAllDevices} onChange={setLogoutAllDevices} />
            </div>
          </form>
        </div>

        <div className={sharedStyles.footer}>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="change-password-form"
              className={clsx(styles.btnPrimary, loading && styles.btnLoading)}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
