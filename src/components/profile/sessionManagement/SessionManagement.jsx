'use client';

import { Monitor, Trash2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

import { useSessions, useDeleteSession } from '@/hooks/useSessions';
import { clearAuthTokens } from '@/lib/api/auth';
import { useToast } from '@/lib/toast/useToast';

import styles from './SessionManagement.module.css';

export default function SessionManagement({ isOpen, onClose }) {
  const router = useRouter();
  const { data: sessionsData, error, loading: isLoading, silentRefetch } = useSessions(isOpen);
  const { deleteSession } = useDeleteSession();
  const { success, error: showError } = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const sessions = sessionsData?.sessions || [];

  const handleDeleteSession = useCallback(
    async (sessionId, isCurrent) => {
      setDeletingId(sessionId);
      try {
        await deleteSession(sessionId);

        if (isCurrent) {
          clearAuthTokens();
          router.push('/login');
          return;
        }

        success('Session removed', 'The session has been successfully removed');
        // Silently revalidate sessions cache without showing loading states
        silentRefetch();
      } catch (err) {
        showError('Failed to remove', err?.message || 'Could not remove session');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteSession, silentRefetch, success, showError, router]
  );

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

  const displayedSessions = showAll ? sessions : sessions.slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Monitor size={20} />
            <h2>Active Sessions</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className={styles.modalSubtitle}>
          Manage your logged-in devices. Removing a session will log out that device.
        </p>

        {isLoading && (
          <div className={styles.stateContainer}>
            <RefreshCw size={24} className={styles.spinnerIcon} />
            <span>Loading sessions...</span>
          </div>
        )}

        {error && (
          <div className={styles.stateContainer}>
            <AlertCircle size={24} />
            <span>Could not load sessions</span>
            <button type="button" onClick={() => silentRefetch()} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className={styles.sessionList}>
              {displayedSessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <div className={styles.sessionIconWrap}>
                    <Monitor size={16} />
                  </div>
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
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteSession(session.id, session.is_current)}
                    disabled={deletingId === session.id}
                    aria-label={`Remove session for ${session.device_name || 'Unknown Device'}`}
                  >
                    {deletingId === session.id ? (
                      <RefreshCw size={14} className={styles.spinnerIcon} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {sessions.length > 5 && (
              <button
                type="button"
                className={styles.showMoreBtn}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show less' : `+${sessions.length - 5} more`}
              </button>
            )}

            {sessions.length === 0 && (
              <div className={styles.emptyState}>No active sessions found</div>
            )}
          </>
        )}

        <div className={styles.modalFooter}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
