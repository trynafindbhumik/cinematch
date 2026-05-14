'use client';

import clsx from 'clsx';
import { X, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { useModal } from '@/context/ModalContext';
import { useInitVerify } from '@/hooks/useInitVerify';
import { usePost } from '@/lib/api';
import { useToast } from '@/lib/toast/useToast';

import sharedStyles from '../Modals.module.css';

import styles from './VerifyEmailModal.module.css';

export default function VerifyEmailModal({ isOpen, onClose, email, onVerified }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [verificationId, setVerificationId] = useState(null);

  const { openModal, closeModal } = useModal();
  const { success, error: showError } = useToast();
  const cooldownIntervalRef = useRef(null);
  const isVerifiedRef = useRef(false);

  // Direct usePost for verification - bypasses useVerifyEmail to avoid any hook-level side effects
  const [verifyData, verifyLoading, verifyError, verifyTrigger] = usePost({
    disableRetries: true,
    onSuccess: (data) => {
      const isVerified = data?.isVerified ?? data?.is_verified;
      if (isVerified && !isVerifiedRef.current) {
        isVerifiedRef.current = true;
        success('Email verified!', 'Welcome aboard!');
        onVerified?.();
        onClose();
      }
    },
  });

  const [, initLoading, , initTrigger] = useInitVerify();

  const startCooldown = useCallback(() => {
    setCooldown(60);

    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendVerificationCode = useCallback(async () => {
    try {
      const data = await initTrigger('/v1/auth/init-verify');

      setVerificationId(data?.verification_id);

      setHasSentCode(true);

      startCooldown();

      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
      showError('Verification failed', 'Could not send verification code');
    }
  }, [initTrigger, startCooldown, showError]);

  useEffect(() => {
    if (isOpen) {
      openModal();

      if (!hasSentCode) {
        queueMicrotask(() => {
          sendVerificationCode();
        });
      }
    }

    return () => {
      closeModal();
    };
  }, [isOpen, hasSentCode, sendVerificationCode, openModal, closeModal]);

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const previousIsOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (wasOpen && !isOpen) {
      queueMicrotask(() => {
        setOtp('');
        setError('');
        setCooldown(0);
        setVerificationId(null);
        setHasSentCode(false);

        isVerifiedRef.current = false;
      });
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    await sendVerificationCode();
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    if (!verificationId) {
      setError('Please request a new verification code');
      return;
    }
    setError('');
    try {
      await verifyTrigger('/v1/auth/verify', { verification_id: verificationId, otp });
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
      showError('Verification failed', 'Invalid or expired code');
    }
  };

  const displayError = error || verifyError?.message || null;

  if (!isOpen) return null;

  const isSuccess = verifyData?.isVerified ?? verifyData?.is_verified;

  const modal = (
    <div
      className={sharedStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={clsx(sharedStyles.sheet, styles.verifySheet)}>
        <div className={sharedStyles.mobileHandle} />

        <div className={sharedStyles.header}>
          <div className={clsx(sharedStyles.headerIcon, !isSuccess && styles.headerIconWarning)}>
            {isSuccess ? <CheckCircle2 size={24} /> : <Mail size={24} />}
          </div>
          <div className={sharedStyles.headerText}>
            <h2 className={clsx('h-3xl', sharedStyles.title)}>
              {isSuccess ? 'Email Verified!' : 'Verify Your Email'}
            </h2>
            <p className={sharedStyles.subtitle}>
              {isSuccess
                ? 'Your email has been verified successfully'
                : `Enter the code sent to ${email || 'your email'}`}
            </p>
          </div>
          {!isSuccess && (
            <button
              type="button"
              className={sharedStyles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={sharedStyles.body}>
          {isSuccess ? (
            <div className={styles.successContent}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={64} />
              </div>
              <p className={styles.successMessage}>
                Welcome aboard! Your account is now fully verified.
              </p>
            </div>
          ) : (
            <div className={styles.stepContent}>
              <div className={styles.otpInputWrapper}>
                <Input
                  variant="filled"
                  label="Verification Code"
                  type="text"
                  value={otp}
                  onChange={(v) => setOtp(v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={cooldown > 0 || initLoading}
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : initLoading
                    ? 'Sending...'
                    : 'Resend code'}
              </button>
              {displayError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={14} />
                  <span>{displayError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isSuccess && (
          <div className={sharedStyles.footer}>
            <div className={styles.actionRow}>
              <button type="button" className={styles.btnSecondary} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleVerify}
                disabled={verifyLoading || otp.length !== 6}
              >
                {verifyLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
