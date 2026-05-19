'use client';

import clsx from 'clsx';
import { X, User, Mail, Upload, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';
import Toggle from '@/components/ui/toggle/Toggle';
import { useModal } from '@/context/ModalContext';
import { useUpdateProfile, useDeleteProfilePicture } from '@/hooks/useProfile';
import { useToast } from '@/lib/toast/useToast';

import sharedStyles from '../Modals.module.css';

import styles from './EditProfileModal.module.css';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onChangeEmail,
  suggestFromOtt,
  onSmartSuggestUpdated,
}) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    smartSuggest: profile?.smartSuggest ?? false,
  });
  const [avatarPreview, setAvatarPreview] = useState(profile?.profileUrl || profile?.avatar || '');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [localSmartSuggest, setLocalSmartSuggest] = useState(profile?.smartSuggest ?? false);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const { openModal, closeModal } = useModal();
  const { success, error: showError } = useToast();

  const fileInputRef = useRef(null);

  const objectUrlRef = useRef(null);
  const previousIsOpenRef = useRef(isOpen);
  const suggestFromOttRef = useRef(suggestFromOtt);
  const smartSuggestChangedRef = useRef(false);

  // Keep ref in sync with prop
  useEffect(() => {
    suggestFromOttRef.current = suggestFromOtt;
  }, [suggestFromOtt]);

  // Track when smart suggest is changed in the modal (different from outer toggle)
  const handleSmartSuggestToggle = (newValue) => {
    setLocalSmartSuggest(newValue);
    smartSuggestChangedRef.current = newValue !== suggestFromOttRef.current;
    // Don't call API here - only call API when user clicks Save button
    // Parent component will handle actual API call
  };

  const [, updateLoading, updateError, updateTrigger] = useUpdateProfile({
    onSuccess: (data) => {
      // Notify parent about smart suggest change so it can sync local state
      if (smartSuggestChangedRef.current) {
        onSmartSuggestUpdated?.(localSmartSuggest);
        smartSuggestChangedRef.current = false;
      }
      success('Profile updated', 'Your changes have been saved');
      // Pass updated data to parent so it can trigger silent refetch
      onSave?.(data);
      onClose();
    },
  });

  const [, deleteLoading, , deleteTrigger] = useDeleteProfilePicture({
    onSuccess: () => {
      success('Photo removed', 'Profile photo has been removed');
      setAvatarPreview('');
      setRemoveAvatar(false);
    },
  });

  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (!wasOpen && isOpen) {
      openModal();

      queueMicrotask(() => {
        setForm({
          name: profile?.name || '',
          smartSuggest: profile?.smartSuggest ?? false,
        });

        setLocalSmartSuggest(suggestFromOttRef.current ?? profile?.smartSuggest ?? false);
        setAvatarPreview(profile?.profileUrl || profile?.avatar || '');
        setAvatarFile(null);
        setFileError('');
        setRemoveAvatar(false);
      });
    }

    if (wasOpen && !isOpen) {
      closeModal();
    }

    previousIsOpenRef.current = isOpen;

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [isOpen, profile, openModal, closeModal, suggestFromOtt]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
  };

  const handleSheetAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const processFile = (file) => {
    setFileError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarPreview(url);
    setAvatarFile(file);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleRemoveAvatar = async () => {
    if (profile?.avatar || profile?.profileUrl) {
      try {
        await deleteTrigger('/v1/profile/me/picture');
        setAvatarPreview('');
        setRemoveAvatar(true);
      } catch {
        // Error handled by hook
      }
    } else {
      setAvatarPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('smartSuggest', String(localSmartSuggest));

    if (removeAvatar) {
      // Signal to delete the avatar - API should handle this
      data.append('removeAvatar', 'true');
    }

    if (avatarFile) {
      data.append('profile_picture', avatarFile);
    }

    try {
      await updateTrigger('/v1/profile/me', data);
    } catch (err) {
      showError('Update failed', err?.message || 'Could not save changes. Please try again');
    }
  };

  const displayError = updateError?.message || fileError;

  const modal = (
    <div
      className={clsx(sharedStyles.overlay, styles.sideOverlay, isClosing && styles.overlayClosing)}
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(sharedStyles.sheet, styles.editSheet, isClosing && styles.editSheetClosing)}
        onAnimationEnd={handleSheetAnimationEnd}
      >
        <div className={sharedStyles.mobileHandle} />

        <div className={sharedStyles.header}>
          <div className={sharedStyles.headerText}>
            <h2 className={clsx('h-3xl', sharedStyles.title)}>Edit Profile</h2>
            <p className={sharedStyles.subtitle}>Update your personal details.</p>
          </div>
          <button
            type="button"
            className={sharedStyles.closeBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={sharedStyles.body}>
          <form id="edit-profile-form" onSubmit={handleSubmit}>
            {/* Avatar Upload Section */}
            <div className={styles.avatarUploadSection}>
              <div className={styles.avatarPreviewImg}>
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <User size={28} />
                  </div>
                )}
              </div>

              <div
                className={clsx(styles.dropZone, isDragging && styles.dropZoneDragging)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Upload avatar image"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={handleFileChange}
                  className={styles.hiddenFileInput}
                  aria-label="Choose avatar file"
                />
                <div className={styles.dropZoneIcon}>
                  <Upload size={20} />
                </div>
                <p className={clsx('text-base-tight', styles.dropZoneTitle)}>
                  {isDragging ? 'Drop your image here' : 'Upload photo'}
                </p>
                <p className={styles.dropZoneHint}>
                  Drag & drop or click — JPEG, PNG, WebP up to {MAX_FILE_SIZE_MB} MB
                </p>
              </div>

              {/* Remove Avatar Button */}
              {(avatarPreview || profile?.avatar || profile?.profileUrl) && (
                <button
                  type="button"
                  className={styles.removeAvatarBtn}
                  onClick={handleRemoveAvatar}
                  disabled={deleteLoading}
                >
                  <Trash2 size={14} />
                  {deleteLoading ? 'Removing...' : 'Remove Photo'}
                </button>
              )}
            </div>

            {fileError && (
              <div className={styles.fileErrorBanner}>
                <AlertCircle size={13} />
                <span>{fileError}</span>
              </div>
            )}

            {/* Name Input */}
            <div className={styles.formGroup}>
              <Input
                variant="filled"
                label="Full Name"
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Your Name"
                prefixIcon={<User size={18} />}
              />
            </div>

            {/* Email Display (Read-only with Change option) */}
            <div className={styles.emailDisplaySection}>
              <div className={styles.emailDisplayRow}>
                <div className={styles.emailValueWrap}>
                  <Mail size={16} className={styles.emailIcon} />
                  <span className={styles.emailValue}>{profile?.email}</span>
                </div>
                <button
                  type="button"
                  className={styles.changeEmailBtn}
                  onClick={() => {
                    handleClose();
                    setTimeout(() => onChangeEmail?.(), 300);
                  }}
                >
                  <Pencil size={12} />
                  Change
                </button>
              </div>
              <p className={styles.emailHint}>
                Want to update your email? Click &quot;Change&quot; to start the verification
                process.
              </p>
            </div>

            {/* Smart Suggest Toggle */}
            <div className={styles.smartSuggestSection}>
              <Toggle
                label="Smart Suggest"
                checked={localSmartSuggest}
                onChange={handleSmartSuggestToggle}
              />
              <p className={styles.smartSuggestHint}>
                Get personalized movie suggestions based on your preferences and watch history.
              </p>
            </div>
          </form>
        </div>

        <div className={sharedStyles.footer}>
          {displayError && (
            <div className={styles.submitErrorBanner}>
              <AlertCircle size={14} />
              <span>{displayError}</span>
            </div>
          )}
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              form="edit-profile-form"
              className={styles.btnPrimary}
              disabled={updateLoading || !form.name?.trim()}
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
