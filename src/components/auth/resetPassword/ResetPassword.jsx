'use client';

import clsx from 'clsx';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { useResetPassword } from '@/hooks/useResetPassword';
import { getErrorMessage } from '@/lib/api/errorCodes';
import { useToast } from '@/lib/toast/useToast';
import { ResetPasswordSchema, validateSchema } from '@/lib/validations/auth';

import styles from '../Auth.module.css';

const RESET_PASSWORD_ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'This reset link has expired. Please request a new one.',
  429: 'Too many attempts. Please wait before trying again.',
  500: 'Could not reset password. Please try again.',
};

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [{ loading, error }, resetPassword] = useResetPassword();
  const { success, error: showError, warning } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    const validation = validateSchema(ResetPasswordSchema, { new_password: password, token });
    if (!validation.success) {
      const errors = {};
      validation.errors.forEach((err) => {
        const field = err.field === 'new_password' ? 'password' : err.field;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      success('Password updated', 'Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      if (err?.status === 401) {
        warning('Link expired', 'Please request a new reset link');
      } else if (err?.status === 429) {
        warning('Too many attempts', 'Please wait before trying again');
      } else {
        showError('Invalid request', 'Please check your input');
      }
    }
  };

  const getError = () => {
    if (error?.status) {
      const { message } = getErrorMessage(
        error.status,
        RESET_PASSWORD_ERROR_MESSAGES,
        error.message
      );
      return message;
    }
    return error?.message || null;
  };

  const displayError = getError();

  if (!token) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className={styles.tabWrapper}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <Lock className={styles.successIcon} />
          </div>
          <h3 className={clsx('text-3xl', 'italic', styles.successTitle)}>Password Updated</h3>
          <p className={clsx('text-base', styles.successText)}>
            Your password has been successfully reset. Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerGroup}>
        <div className={styles.badge}>
          <Lock className={styles.badgeIcon} />
          <span className={clsx('text-xs', styles.badgeText)}>Security First</span>
        </div>

        <h1 className={clsx('text-6xl', styles.heading)}>
          New <br />
          <em>Beginnings.</em>
        </h1>

        <p className={clsx('text-base', styles.subheading)}>
          Create a strong new password to protect your curated movie collection.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          variant="underline"
          type="password"
          label="New Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          errorMessage={fieldErrors.password}
        />

        <Input
          variant="underline"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          errorMessage={fieldErrors.confirmPassword}
        />

        {displayError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={14} />
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
            {loading ? 'Updating…' : 'Update Password'}
          </span>
        </Button>
      </form>
    </div>
  );
}
