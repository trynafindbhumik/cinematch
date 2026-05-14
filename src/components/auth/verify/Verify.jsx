'use client';

import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { useVerifyToken } from '@/hooks/useVerifyToken';
import { saveAuthTokens, saveAuthFlags } from '@/lib/api';

import styles from './Verify.module.css';

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [, startTransition] = useTransition();

  const [state, setState] = useState({ status: 'idle', errorMessage: '' });
  const [, verifyToken] = useVerifyToken();

  useEffect(() => {
    if (!token) {
      startTransition(() => {
        setState({ status: 'error', errorMessage: 'No verification token provided' });
      });
      return;
    }

    startTransition(() => {
      setState({ status: 'verifying', errorMessage: '' });
    });

    verifyToken({ token }).then(
      (response) => {
        startTransition(() => {
          if (response?.access_token) {
            saveAuthTokens({ accessToken: response.access_token });
            saveAuthFlags({
              isVerified: response.is_verified,
              needsOnboarding: response.needs_onboarding,
            });
          }
          // Tour auto-starts on /home when needsOnboarding is true (handled by TourContext)
          setState({ status: 'success', errorMessage: '' });
          setTimeout(() => {
            router.push('/home');
          }, 1500);
        });
      },
      (err) => {
        startTransition(() => {
          setState({
            status: 'error',
            errorMessage: err.message || 'Verification failed. The link may have expired.',
          });
        });
      }
    );
  }, [token, verifyToken, router]);

  const renderContent = () => {
    if (!token) {
      return (
        <div className={styles.messageCard}>
          <div className={styles.errorIcon}>
            <Mail size={32} />
          </div>
          <h2 className={styles.messageTitle}>Invalid Link</h2>
          <p className={styles.messageText}>
            This verification link is invalid or missing a token.
          </p>
          <button type="button" className={styles.ctaButton} onClick={() => router.push('/signup')}>
            Go to Signup
          </button>
        </div>
      );
    }

    if (state.status === 'verifying' || state.status === 'idle') {
      return (
        <div className={styles.messageCard}>
          <div className={styles.loadingIcon}>
            <Loader2 size={32} className={styles.spinner} />
          </div>
          <h2 className={styles.messageTitle}>Verifying...</h2>
          <p className={styles.messageText}>Please wait while we verify your email.</p>
        </div>
      );
    }

    if (state.status === 'success') {
      return (
        <div className={styles.messageCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={32} />
          </div>
          <h2 className={styles.messageTitle}>Email Verified!</h2>
          <p className={styles.messageText}>Redirecting you to your account...</p>
        </div>
      );
    }

    return (
      <div className={styles.messageCard}>
        <div className={styles.errorIcon}>
          <Mail size={32} />
        </div>
        <h2 className={styles.messageTitle}>Verification Failed</h2>
        <p className={styles.messageText}>{state.errorMessage}</p>
        <button type="button" className={styles.ctaButton} onClick={() => router.push('/signup')}>
          Go to Signup
        </button>
      </div>
    );
  };

  return <div className={styles.wrapper}>{renderContent()}</div>;
}
