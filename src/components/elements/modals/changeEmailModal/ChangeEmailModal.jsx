'use client';

import clsx from 'clsx';
import { X, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import { useModal } from '@/context/ModalContext';
import {
  useInitiateEmailChange,
  useResendEmailChangeOtp,
  useVerifyEmail,
} from '@/hooks/useProfile';
import { useToast } from '@/lib/toast/useToast';

import sharedStyles from '../Modals.module.css';

import styles from './ChangeEmailModal.module.css';

const STEPS = {
  ENTER_EMAIL: 'enter_email',
  ENTER_OTP: 'enter_otp',
  SUCCESS: 'success',
};

export default function ChangeEmailModal({ isOpen, onClose, currentEmail }) {
  const [step, setStep] = useState(STEPS.ENTER_EMAIL);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const { openModal, closeModal } = useModal();
  const { success, error: showError } = useToast();

  const cooldownIntervalRef = useRef(null);
  const previousIsOpenRef = useRef(isOpen);

  const [, initiateLoading, initiateError, initiateTrigger] = useInitiateEmailChange();

  const [, , resendError, resendTrigger] = useResendEmailChangeOtp();

  const [, verifyLoading, verifyError, verifyTrigger] = useVerifyEmail();
  useEffect(() => {
    if (isOpen) {
      openModal();
    }

    return () => {
      closeModal();
    };
  }, [isOpen, openModal, closeModal]);

  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (wasOpen && !isOpen) {
      setStep(STEPS.ENTER_EMAIL);
      setNewEmail('');
      setOtp('');
      setError('');
      setSuccessMessage('');
      setCooldown(0);

      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

  const startCooldown = useCallback(() => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    setCooldown(60);

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const handleInitiate = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (newEmail === currentEmail) {
      setError('This is already your email address');
      return;
    }

    setError('');

    try {
      const response = await initiateTrigger('/v1/profile/email/change', { newEmail });

      if (response?.step === 'otp_sent_to_new' || response?.step === 'otp_sent_to_old') {
        setStep(STEPS.ENTER_OTP);
        startCooldown();
        success('Code sent', 'Check your email for the verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
      showError('Failed to send', 'Could not send verification code');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) {
      return;
    }

    setError('');

    try {
      await resendTrigger('/v1/profile/email/resend');
      startCooldown();
      success('Code resent', 'Check your email for a new code');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
      showError('Failed to resend', 'Please try again');
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-character code');
      return;
    }

    setError('');

    try {
      const response = await verifyTrigger('/v1/profile/verify', { otp });

      if (response?.step === 'email_updated') {
        setStep(STEPS.SUCCESS);
        success('Email updated', 'Your email has been changed successfully');
        setSuccessMessage(`Email updated to ${response.newEmail || newEmail}`);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
      showError('Verification failed', 'Invalid code. Please try again');
    }
  };

  const displayError =
    error || initiateError?.message || resendError?.message || verifyError?.message;

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div
      className={sharedStyles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={clsx(sharedStyles.sheet, styles.emailSheet)}>
        <div className={sharedStyles.mobileHandle} />

        <div className={sharedStyles.header}>
          <div className={sharedStyles.headerText}>
            <h2 className={clsx('h-3xl', sharedStyles.title)}>
              {step === STEPS.ENTER_EMAIL && 'Change Email'}
              {step === STEPS.ENTER_OTP && 'Verify New Email'}
              {step === STEPS.SUCCESS && 'Email Updated'}
            </h2>

            <p className={sharedStyles.subtitle}>
              {step === STEPS.ENTER_EMAIL && 'Enter your new email address'}

              {step === STEPS.ENTER_OTP && `We sent a code to ${currentEmail}`}

              {step === STEPS.SUCCESS && 'Your email has been updated successfully'}
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

        <div className={sharedStyles.body}>
          {step === STEPS.ENTER_EMAIL && (
            <div className={styles.stepContent}>
              <div className={styles.inputWrapper}>
                <Input
                  variant="filled"
                  label="New Email Address"
                  type="email"
                  value={newEmail}
                  onChange={setNewEmail}
                  placeholder="new@example.com"
                  prefixIcon={<Mail size={18} />}
                />
              </div>

              {displayError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={14} />
                  <span>{displayError}</span>
                </div>
              )}
            </div>
          )}

          {step === STEPS.ENTER_OTP && (
            <div className={styles.stepContent}>
              <p className={styles.otpInstructions}>
                Enter the 6-character code sent to <strong>{currentEmail}</strong> to verify this
                email change.
              </p>

              <div className={styles.otpInputWrapper}>
                <Input
                  variant="filled"
                  label="Verification Code"
                  type="text"
                  value={otp}
                  onChange={(value) => setOtp(value.slice(0, 6).toUpperCase())}
                  placeholder="AB12CD"
                  maxLength={6}
                />
              </div>

              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>

              {displayError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={14} />
                  <span>{displayError}</span>
                </div>
              )}
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className={styles.successContent}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={48} />
              </div>

              <p className={styles.successMessage}>{successMessage}</p>
            </div>
          )}
        </div>

        <div className={sharedStyles.footer}>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              {step === STEPS.SUCCESS ? 'Done' : 'Cancel'}
            </button>

            {step === STEPS.ENTER_EMAIL && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleInitiate}
                disabled={initiateLoading}
              >
                {initiateLoading ? 'Sending...' : 'Continue'}

                <ArrowRight size={16} />
              </button>
            )}

            {step === STEPS.ENTER_OTP && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleVerify}
                disabled={verifyLoading || otp.length !== 6}
              >
                {verifyLoading ? 'Verifying...' : 'Verify'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
