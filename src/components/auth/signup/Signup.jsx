'use client';

import clsx from 'clsx';
import { AlertCircle, Mail, Lock, User, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { useResendVerification } from '@/hooks/useResendVerification';
import { useSignup } from '@/hooks/useSignup';
import { saveAuthTokens, saveAuthFlags } from '@/lib/api';
import { useToast } from '@/lib/toast/useToast';
import { ResendSchema, SignupSchema, validateSchema } from '@/lib/validations/auth';

import styles from '../Auth.module.css';

import OtpVerification from './OtpVerification';

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationId, setVerificationId] = useState('');
  const [{ loading, error }, signup] = useSignup();
  const [, , , resendTrigger] = useResendVerification();
  const { success, error: showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateSchema(SignupSchema, formData);
    if (!validation.success) {
      const errors = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      const result = await signup(formData);

      if (result?.verification_id) {
        setVerificationId(result.verification_id);
        setStep('otp');
        success('Code sent', 'Check your email for the verification code');
      }
    } catch (err) {
      if (err?.status === 409) {
        showError('Account exists', 'An account with this email already exists');
      } else {
        showError('Signup failed', err.message || 'Please try again');
      }
    }
  };

  const handleOtpVerified = async (response) => {
    if (response?.access_token) {
      saveAuthTokens({ accessToken: response.access_token });
      saveAuthFlags({
        isVerified: response.is_verified,
        needsOnboarding: response.needs_onboarding,
      });
    }

    // Tour auto-starts on /home when needs_onboarding cookie is true (handled by TourContext)
    router.push('/home');
  };

  const handleResend = async () => {
    try {
      const validation = validateSchema(ResendSchema, { email: formData.email });
      if (!validation.success) {
        return { success: false, message: validation.errorMessage };
      }
      const result = await resendTrigger('/v1/auth/resend', validation.data);
      if (result?.verification_id) {
        setVerificationId(result.verification_id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to resend code' };
    }
  };

  if (step === 'otp') {
    return (
      <OtpVerification
        email={formData.email}
        verificationId={verificationId}
        onBack={() => setStep('form')}
        onVerify={handleOtpVerified}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerGroup}>
        <div className={styles.badge}>
          <Sparkles className={styles.badgeIcon} />
          <span className={clsx('text-xs', styles.badgeText)}>Join the Club</span>
        </div>

        <h1 className={clsx('text-6xl', styles.heading)}>
          Begin Your <br />
          <em>Journey.</em>
        </h1>

        <p className={clsx('text-base', styles.subheading)}>
          Create an account to unlock personalized AI recommendations and start swiping.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          variant="underline"
          type="text"
          label="Full Name"
          value={formData.name}
          onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
          placeholder="John Doe"
          prefixIcon={<User size={16} />}
          errorMessage={fieldErrors.name}
        />

        <Input
          variant="underline"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
          placeholder="name@example.com"
          prefixIcon={<Mail size={16} />}
          errorMessage={fieldErrors.email}
        />

        <Input
          variant="underline"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(val) => setFormData((prev) => ({ ...prev, password: val }))}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          errorMessage={fieldErrors.password}
        />

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={14} />
            <span>{error.message}</span>
          </div>
        )}

        <Button
          variant="cinema"
          type="submit"
          disabled={!formData.name || !formData.email || !formData.password || loading}
          rightIcon={loading ? null : <ArrowRight size={16} />}
          className={styles.ctaButton}
        >
          {loading ? (
            <span className={clsx('text-sm', styles.ctaLabel, styles.loadingWrap)}>
              <span className={styles.spinner} />
              Sending code...
            </span>
          ) : (
            <span className={clsx('text-sm', styles.ctaLabel)}>Create Account</span>
          )}
        </Button>
      </form>

      <div className={styles.linkRow}>
        <p className={clsx('text-base', styles.linkPrompt)}>Already a member?</p>
        <button
          type="button"
          className={clsx('text-base', styles.linkBtn)}
          onClick={() => router.push('/login')}
        >
          Sign in instead
          <ChevronRight className={styles.chevronIcon} />
        </button>
      </div>
    </div>
  );
}
