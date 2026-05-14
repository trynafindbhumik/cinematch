'use client';

import clsx from 'clsx';
import { Mail, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import Button from '@/components/ui/button/Button';
import { useVerifyOtp } from '@/hooks/useVerifyOtp';
import { useToast } from '@/lib/toast/useToast';

import styles from './OtpVerification.module.css';

const RESEND_COOLDOWN = 60;

export default function OtpVerification({ email, verificationId, onBack, onVerify, onResend }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const [, verifyOtp] = useVerifyOtp();
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (timeLeft <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      const result = await onResend?.();
      if (result?.success) {
        setTimeLeft(RESEND_COOLDOWN);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        success('Code resent', 'Check your email for a new code');
      } else if (result?.message) {
        setError(result.message);
        showError('Failed to resend', result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
      showError('Failed to resend', err.message || 'Please try again');
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (index, value) => {
    const cleaned = value
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-1)
      .toLowerCase();
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toLowerCase();
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((val) => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('').toLowerCase();
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await verifyOtp({
        otp: otpString,
        verification_id: verificationId,
      });
      await onVerify(response);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      showError('Verification failed', 'Invalid code. Please try again');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');
  const canResend = timeLeft === 0;

  const OTP_KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerGroup}>
        <div className={styles.badge}>
          <Mail className={styles.badgeIcon} />
          <span className={clsx('text-xs', styles.badgeText)}>Verify Email</span>
        </div>

        <h1 className={clsx('text-6xl', styles.heading)}>
          Check Your <br />
          <em>Inbox.</em>
        </h1>

        <p className={clsx('text-base', styles.subheading)}>
          We sent a 6-digit verification code to <br />
          <strong>{email}</strong>
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.otpContainer} onPaste={handlePaste}>
          {OTP_KEYS.map((key, index) => (
            <input
              key={key}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={clsx(styles.otpInput, otp[index] && styles.filled)}
              disabled={isLoading}
              autoComplete="off"
            />
          ))}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <Button
          variant="cinema"
          type="submit"
          disabled={!isComplete || isLoading}
          rightIcon={isLoading ? null : <ArrowRight size={16} />}
          className={styles.ctaButton}
        >
          {isLoading ? (
            <span className={clsx('text-sm', styles.ctaLabel, styles.loadingWrap)}>
              <Loader2 className={styles.spinner} size={16} />
              Verifying...
            </span>
          ) : (
            <span className={clsx('text-sm', styles.ctaLabel)}>Verify & Create Account</span>
          )}
        </Button>
      </form>

      <div className={styles.linkRow}>
        <button type="button" className={clsx('text-base', styles.linkBtn)} onClick={onBack}>
          <ArrowLeft className={styles.chevronIcon} />
          Back to signup
        </button>
      </div>

      <div className={styles.resendSection}>
        {canResend ? (
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className={clsx(styles.resendSpinner, styles.spinning)} size={14} />
                Sending...
              </>
            ) : (
              'Resend Code'
            )}
          </button>
        ) : (
          <p className={clsx('text-xs', styles.resendNote)}>
            Resend code in <span className={styles.countdown}>{timeLeft}s</span>
          </p>
        )}
      </div>
    </div>
  );
}
