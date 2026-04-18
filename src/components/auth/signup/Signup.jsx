'use client';

import clsx from 'clsx';
import { Mail, Lock, User, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

import styles from '../Auth.module.css';

import OtpVerification from './OtpVerification';

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setStep('otp');
  };

  const handleOtpVerified = async (otp) => {
    // eslint-disable-next-line no-console
    console.log('OTP verified:', otp);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/login');
  };

  const handleResend = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  if (step === 'otp') {
    return (
      <OtpVerification
        email={formData.email}
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

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          variant="underline"
          type="text"
          label="Full Name"
          value={formData.name}
          onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
          placeholder="John Doe"
          prefixIcon={<User size={16} />}
        />

        <Input
          variant="underline"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
          placeholder="name@example.com"
          prefixIcon={<Mail size={16} />}
        />

        <Input
          variant="underline"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(val) => setFormData((prev) => ({ ...prev, password: val }))}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
        />

        <Button
          variant="cinema"
          type="submit"
          disabled={!formData.name || !formData.email || !formData.password || isLoading}
          rightIcon={isLoading ? null : <ArrowRight size={16} />}
          className={styles.ctaButton}
        >
          {isLoading ? (
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
