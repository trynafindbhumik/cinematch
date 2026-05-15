'use client';

import clsx from 'clsx';
import { Mail, Lock, ArrowRight, ChevronRight, Sparkles, AlertCircle, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { useLogin } from '@/hooks/useLogin';
import { useDeleteSession, useFetchSessionsWithMagicLink } from '@/hooks/useSessions';
import { saveAuthTokens, saveAuthFlags, clearAuthTokens } from '@/lib/api/auth';
import { getErrorMessage, AUTH_ERROR_MESSAGES } from '@/lib/api/errorCodes';
import { useToast } from '@/lib/toast/useToast';
import { LoginSchema, validateSchema } from '@/lib/validations/auth';

import styles from '../Auth.module.css';

const MAX_SESSIONS = 5;

export default function Login() {
  const router = useRouter();
  const [{ loading, error }, login] = useLogin();
  const { success, error: showError, warning, info } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pendingSessionData, setPendingSessionData] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [magicLink, setMagicLink] = useState(null);

  const { deleteSession } = useDeleteSession();
  const { data: sessionsData } = useFetchSessionsWithMagicLink(magicLink);

  // Auto-populate sessions when data arrives
  useEffect(() => {
    if (sessionsData?.sessions) {
      setSessions(sessionsData.sessions);
      setShowSessionModal(true);
      info('Session limit reached', 'Please remove a session to continue');
    }
  }, [sessionsData, info]);

  const handleLoginSuccess = async (result) => {
    if (result.access_token) {
      saveAuthTokens({ accessToken: result.access_token });
      saveAuthFlags({
        isVerified: result.is_verified,
        needsOnboarding: result.needs_onboarding,
      });
    }
    success('Welcome back!', 'Redirecting...');
    router.push('/home');
  };

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
      const result = await login(formData);

      if (result?.is_session_exhausted && result?.magic_link) {
        setPendingSessionData(result);
        setMagicLink(result.magic_link);
        return;
      }

      if (result?.access_token) {
        await handleLoginSuccess(result);
      } else {
        showError('Login failed', 'Unable to complete login');
      }
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

  const removeSessionAndLogin = async (sessionId) => {
    setDeletingSessionId(sessionId);
    try {
      const result = await deleteSession(sessionId, pendingSessionData?.magic_link);

      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);

      if (result?.access_token) {
        setShowSessionModal(false);
        clearAuthTokens();
        saveAuthTokens({ accessToken: result.access_token });
        saveAuthFlags({
          isVerified: result.is_verified,
          needsOnboarding: result.needs_onboarding,
        });
        success('Session removed', 'Redirecting...');
        router.push('/home');
      } else if (updatedSessions.length < MAX_SESSIONS && pendingSessionData) {
        setShowSessionModal(false);
        await handleLoginSuccess(pendingSessionData);
      }
    } catch {
      showError('Error', 'Could not remove session');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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
    <>
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

      {showSessionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.sessionModal}>
            <div className={styles.sessionModalHeader}>
              <Monitor size={24} />
              <h2>Session Limit Reached</h2>
            </div>
            <p className={styles.sessionModalText}>
              You have reached the maximum of {MAX_SESSIONS} active sessions. Please remove one to
              continue.
            </p>

            <div className={styles.sessionList}>
              {sessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionDeviceRow}>
                      <span className={styles.sessionDevice}>
                        {session.device_name || 'Unknown Device'}
                      </span>
                      {session.is_current && <span className={styles.currentChip}>Current</span>}
                    </div>
                    <span className={styles.sessionMeta}>
                      Created {formatDate(session.created_at)} • Last used{' '}
                      {formatRelativeTime(session.last_login)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeSessionBtn}
                    onClick={() => removeSessionAndLogin(session.id)}
                    disabled={deletingSessionId === session.id}
                  >
                    {deletingSessionId === session.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.cancelSessionBtn}
              onClick={() => {
                setShowSessionModal(false);
                setPendingSessionData(null);
                setMagicLink(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
