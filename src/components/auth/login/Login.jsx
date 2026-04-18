'use client';

import clsx from 'clsx';
import { Mail, Lock, ArrowRight, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

import styles from '../Auth.module.css';

const DEMO_EMAIL = 'demo@cinematch.app';
const DEMO_PASSWORD = 'cinema123';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 700));

    if (email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      router.push('/home');
    } else {
      setLoading(false);
      setError(`Invalid credentials. Use: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    }
  };

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

      <div className={styles.demoHint}>
        <span className={clsx('text-micro', styles.demoHintLabel)}>Demo credentials</span>
        <code className={clsx('text-sm', styles.demoHintCode)}>
          {DEMO_EMAIL} / {DEMO_PASSWORD}
        </code>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          variant="underline"
          type="email"
          label="Email Address"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
          prefixIcon={<Mail size={16} />}
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

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={14} />
            <span>{error}</span>
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
