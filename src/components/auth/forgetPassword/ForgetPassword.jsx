'use client';

import clsx from 'clsx';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { useResendResetPassword } from '@/hooks/useResendResetPassword';
import { getErrorMessage } from '@/lib/api/errorCodes';
import { useToast } from '@/lib/toast/useToast';
import { ForgotPasswordSchema, validateSchema } from '@/lib/validations/auth';

import styles from '../Auth.module.css';

const FORGOT_PASSWORD_ERROR_MESSAGES = {
  400: 'Please enter a valid email address.',
  404: 'No account found with this email address.',
  429: 'Too many attempts. Please wait before trying again.',
  500: 'Could not send reset link. Please try again.',
};

export default function ForgotPassword() {
  const router = useRouter();
  const [{ loading, error }, forgotPassword] = useForgotPassword();
  const [, resendReset] = useResendResetPassword();
  const { success, error: showError, warning } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateSchema(ForgotPasswordSchema, { email });
    if (!validation.success) {
      const errors = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      success('Check your inbox', 'We sent a reset link to your email');
    } catch (err) {
      if (err?.status === 400) {
        showError('Invalid email', 'Please enter a valid email address');
      } else if (err?.status === 404) {
        showError('No account found', 'We could not find an account with this email');
      } else if (err?.status === 429) {
        warning('Too many attempts', 'Please wait before trying again');
      } else {
        showError('Failed to send', 'Could not send reset link. Please try again');
      }
    }
  };

  const handleResend = async () => {
    setFieldErrors({});

    const validation = validateSchema(ForgotPasswordSchema, { email });
    if (!validation.success) {
      const errors = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await resendReset(email);
      success('Code resent', 'Check your email for a new reset link');
    } catch {
      showError('Failed to resend', 'Please try again');
    }
  };

  const getError = () => {
    if (error?.status) {
      const { message } = getErrorMessage(
        error.status,
        FORGOT_PASSWORD_ERROR_MESSAGES,
        error.message
      );
      return message;
    }
    return error?.message || null;
  };

  const displayError = getError();

  return (
    <div className={styles.tabWrapper}>
      <button
        type="button"
        className={clsx('text-micro', styles.backBtn)}
        onClick={() => router.push('/login')}
      >
        <ArrowLeft className={styles.backArrow} />
        Back to Login
      </button>

      <div className={styles.headerGroup}>
        <h1 className={clsx('text-6xl', styles.heading)}>
          Lost Your <br />
          <em>Way?</em>
        </h1>

        <p className={clsx('text-base', styles.subheading)}>
          Don&apos;t worry. Enter your email and we&apos;ll send you a magic link to get back to
          your cinema.
        </p>
      </div>

      {!isSubmitted ? (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            variant="underline"
            type="email"
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            prefixIcon={<Mail size={16} />}
            errorMessage={fieldErrors.email}
          />

          {displayError && (
            <div className={styles.errorBanner}>
              <span>{displayError}</span>
            </div>
          )}

          <Button
            variant="cinema"
            type="submit"
            rightIcon={!loading && <ArrowRight size={16} />}
            className={styles.ctaButton}
            disabled={loading}
          >
            <span className={clsx('text-sm', styles.ctaLabel)}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </span>
          </Button>
        </form>
      ) : (
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle2 className={styles.successIcon} />
          </div>
          <h3 className={clsx('text-3xl', 'italic', styles.successTitle)}>Check your inbox</h3>
          <p className={clsx('text-base', styles.successText)}>
            We&apos;ve sent a recovery link to <span className={styles.successEmail}>{email}</span>.
          </p>
          <p className={clsx('text-sm', styles.resendNote)}>
            Didn&apos;t receive it?{' '}
            <button type="button" onClick={handleResend} className={styles.resendLink}>
              Resend link
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
