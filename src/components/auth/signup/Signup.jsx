'use client';

import clsx from 'clsx';
import { Mail, Lock, User, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

import styles from '../Auth.module.css';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <Input
          variant="underline"
          type="text"
          label="Full Name"
          value={name}
          onChange={setName}
          placeholder="John Doe"
          prefixIcon={<User size={16} />}
        />

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
        />

        <Button
          variant="cinema"
          type="submit"
          rightIcon={<ArrowRight size={16} />}
          className={styles.ctaButton}
        >
          <span className={clsx('text-sm', styles.ctaLabel)}>Create Account</span>
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
