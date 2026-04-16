'use client';

import clsx from 'clsx';
import { Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

import styles from '../Auth.module.css';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/login');
  };

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

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          variant="underline"
          type="password"
          label="New Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          required
        />

        <Input
          variant="underline"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          prefixIcon={<Lock size={16} />}
          required
        />

        <Button
          variant="cinema"
          type="submit"
          rightIcon={<ArrowRight size={16} />}
          className={styles.ctaButton}
        >
          <span className={clsx('text-sm', styles.ctaLabel)}>Update Password</span>
        </Button>
      </form>
    </div>
  );
}
