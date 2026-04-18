'use client';

import clsx from 'clsx';
import { X, User, Mail, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import Input from '@/components/ui/input/Input';

import sharedStyles from '../Modals.module.css';

import styles from './EditProfileModal.module.css';

/**
 *
 * Props:
 *  - isOpen      : boolean
 *  - onClose     : () => void
 *  - profile     : { name, email, avatar }
 *  - onSave      : (updatedProfile) => void
 */

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [form, setForm] = useState(() => ({ ...profile }));
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar ?? '');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [isClosing, setIsClosing] = useState(false);

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;

    if (isOpen || isClosing) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  if (typeof window === 'undefined') return null;
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
    setForm((prev) => ({ ...prev, avatar: url, avatarFile: file }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({ ...form, avatar: avatarPreview });
    handleClose();
  };

  const modal = (
    <div
      className={clsx(sharedStyles.overlay, styles.sideOverlay, isClosing && styles.overlayClosing)}
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(sharedStyles.sheet, styles.editSheet, isClosing && styles.editSheetClosing)}
        onAnimationEnd={handleSheetAnimationEnd}
      >
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
            </div>

            {fileError && (
              <div className={styles.fileErrorBanner}>
                <AlertCircle size={13} />
                <span>{fileError}</span>
              </div>
            )}

            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <Input
                variant="filled"
                label="Full Name"
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Your Name"
                prefixIcon={<User size={18} />}
              />
              <Input
                variant="filled"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                placeholder="you@example.com"
                prefixIcon={<Mail size={18} />}
              />
            </div>
          </form>
        </div>

        <div className={sharedStyles.footer}>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" form="edit-profile-form" className={styles.btnPrimary}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
