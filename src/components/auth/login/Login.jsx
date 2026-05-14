'use client';

import clsx from 'clsx';
import { Mail, Lock, ArrowRight, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { useLogin } from '@/hooks/useLogin';
import { getErrorMessage, AUTH_ERROR_MESSAGES } from '@/lib/api/errorCodes';
import { useToast } from '@/lib/toast/useToast';
import { LoginSchema, validateSchema } from '@/lib/validations/auth';

import styles from '../Auth.module.css';

export default function Login() {
  const router = useRouter();
  const [{ loading, error }, login] = useLogin();
  const { success, error: showError, warning } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const formData = { email, password };
    const validation = validateSchema(LoginSchema, formData);

    if (!validation.success) {
      const errors = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await login(formData);
      success('Welcome back!', 'Redirecting...');
      // Tour auto-starts on /home if needs_onboarding cookie is true (handled by TourTrigger)
      router.push('/home');
    } catch (err) {
      const errorStatus = err?.status;
      if (errorStatus === 429) {
        warning('Too many attempts', 'Please wait before trying again');
      } else if (errorStatus === 500) {
        showError('Something went wrong', 'Please try again later');
      } else {
        showError('Login failed', 'Invalid email or password');
      }
    }
  };

  const getError = () => {
    if (error?.status) {
      const { message } = getErrorMessage(error.status, AUTH_ERROR_MESSAGES, error.message);
      return message;
    }
    return error?.message || null;
  };

  const displayError = getError();

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerGroup}>
        <div className={styles.badge}>
          <Sparkles className={styles.badgeIcon} />
          <span className={clsx('text-xs', styles.badgeText)}>AI Powered Discovery</span>
        </div>

        <h1 className={clsx('text-6xl', styles.heading)}>
          Discover <br />
          <em>Differently.</em>
        </h1>

        <p className={clsx('text-base', styles.subheading)}>
          Sign in to start swiping through thousands of curated titles tailored to your unique
          taste.
        </p>
      </div>

      {/* Form */}
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

        <Input
          variant="underline"
          type="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          required
          errorMessage={fieldErrors.password}
          actionLabel={
            <button
              type="button"
              className={clsx('text-micro', styles.forgotLink)}
              onClick={() => router.push('/forgot-password')}
            >
              Forgot Password?
            </button>
          }
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
            {loading ? 'Signing in…' : 'Access Cinema'}
          </span>
        </Button>
      </form>

      <div className={styles.linkRow}>
        <p className={clsx('text-base', styles.linkPrompt)}>New to the experience?</p>
        <button
          type="button"
          className={clsx('text-base', styles.linkBtn)}
          onClick={() => router.push('/signup')}
        >
          Join CineMatch
          <ChevronRight className={styles.chevronIcon} />
        </button>
      </div>
    </div>
  );
}
