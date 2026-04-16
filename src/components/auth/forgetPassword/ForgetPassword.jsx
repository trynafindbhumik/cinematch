'use client';

import clsx from 'clsx';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

import styles from '../Auth.module.css';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

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
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            variant="underline"
            type="email"
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            prefixIcon={<Mail size={16} />}
            required
          />

          <Button
            variant="cinema"
            type="submit"
            rightIcon={<ArrowRight size={16} />}
            className={styles.ctaButton}
          >
            <span className={clsx('text-sm', styles.ctaLabel)}>Send Reset Link</span>
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
        </div>
      )}
    </div>
  );
}
