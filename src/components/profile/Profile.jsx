'use client';

import clsx from 'clsx';
import { Camera, Pencil, Mail, Star, Plus, X, Lock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

import ChangePasswordModal from '@/components/elements/modals/changePasswordModal/ChangePasswordModal';
import DeleteAccountModal from '@/components/elements/modals/deleteAccountModal/DeleteAccountModal';
import EditProfileModal from '@/components/elements/modals/editProfileModal/EditProfileModal';
import OttModal from '@/components/elements/modals/ottModal/OttModal';
// import Reviews          from '@/components/profile/tabs/reviews/reviews';
// import WatchedTab       from '@/components/profile/tabs/watched/watched';
// import WatchlistTab     from '@/components/profile/tabs/watchlist/watchlist';
import Overview from '@/components/profile/tabs/overview/Overview';
import Toggle from '@/components/ui/toggle/Toggle';
import { GENRES, OTT_COLORS, INITIAL_PROFILE } from '@/mocks/data';

import styles from './Profile.module.css';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'watched', label: 'Watched' },
  { id: 'reviews', label: 'Reviews' },
];

export default function ProfileComponent() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestFromOtt, setSuggestFromOtt] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOttOpen, setIsOttOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback((tabId) => {
    const el = tabRefs.current[tabId];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, []);

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, updateIndicator]);

  const handleProfileUpdate = (updated) => setProfile(updated);

  const handleToggleGenre = (genre) => {
    const current = profile.preferredGenres ?? [];
    handleProfileUpdate({
      ...profile,
      preferredGenres: current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre],
    });
  };

  const handleToggleOtt = (ott) => {
    const current = profile.preferredOtts ?? [];
    handleProfileUpdate({
      ...profile,
      preferredOtts: current.includes(ott) ? current.filter((o) => o !== ott) : [...current, ott],
    });
  };

  const handleRemoveOtt = (ott) =>
    handleProfileUpdate({
      ...profile,
      preferredOtts: (profile.preferredOtts ?? []).filter((o) => o !== ott),
    });

  return (
    <>
      <div className={styles.page}>
        <section className={styles.infoCard}>
          <div className={styles.avatarRow}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>
                <Image
                  src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.email}`}
                  alt={profile.name}
                  fill
                  sizes="6rem"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                type="button"
                className={styles.editAvatarBtn}
                onClick={() => setIsEditOpen(true)}
                aria-label="Edit profile"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className={styles.profileMeta}>
              <div className={styles.nameRow}>
                <h1 className={clsx('text-6xl', 'md:h-3xl', styles.profileName)}>{profile.name}</h1>
                <button
                  type="button"
                  className={clsx('text-micro', styles.editProfileBtn)}
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil size={10} />
                  Edit Profile
                </button>
              </div>

              <div className={styles.contactRow}>
                <span className={clsx('text-xs', styles.contactItem)}>
                  <Mail className={styles.contactIcon} />
                  {profile.email}
                </span>
              </div>

              <div className={styles.badgeRow}>
                <span className={clsx('text-micro', styles.badge)}>
                  <span className={styles.badgeDot} />
                  Verified Member
                </span>
                <span className={clsx('text-micro', styles.badge)}>
                  <Star className={styles.badgeStar} />
                  Cinephile Elite
                </span>
              </div>
            </div>
          </div>

          <div className={styles.settingsGrid}>
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <span className={clsx('text-micro', styles.settingsSectionLabel)}>
                  Preferred Genres
                </span>
                <span className={clsx('text-micro', styles.settingsSectionCount)}>
                  {(profile.preferredGenres ?? []).length} Selected
                </span>
              </div>
              <div className={styles.genreChips}>
                {GENRES.map((g) => {
                  const isActive = (profile.preferredGenres ?? []).includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      className={`${styles.genreChip} ${isActive ? styles.genreChipActive : ''}`}
                      onClick={() => handleToggleGenre(g)}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <span className={styles.settingsSectionLabel}>Streaming Services</span>
                <div className={styles.streamToggleRow}>
                  <Toggle
                    label="Smart Suggest"
                    checked={suggestFromOtt}
                    onChange={setSuggestFromOtt}
                  />
                </div>
              </div>

              <div className={styles.ottChips}>
                {(profile.preferredOtts ?? []).map((ott) => {
                  const color = OTT_COLORS[ott] || '#8c7851';
                  return (
                    <span key={ott} className={clsx('text-micro', styles.ottChip)}>
                      <span className={styles.ottDot} style={{ background: color }} />
                      {ott}
                      <button
                        type="button"
                        className={styles.removeOttBtn}
                        onClick={() => handleRemoveOtt(ott)}
                        aria-label={`Remove ${ott}`}
                      >
                        <X size={8} />
                      </button>
                    </span>
                  );
                })}

                <button
                  type="button"
                  className={clsx('text-micro', styles.addOttBtn)}
                  onClick={() => setIsOttOpen(true)}
                >
                  <Plus size={12} />
                  Add Service
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.changePasswordCard}>
          <div className={styles.changePasswordInfo}>
            <div className={styles.changePasswordIconWrap}>
              <Lock size={18} />
            </div>
            <div className={styles.changePasswordText}>
              <p className={clsx('text-base-tight', styles.changePasswordTitle)}>
                Password & Security
              </p>
              <p className={clsx('text-micro', styles.changePasswordSubtitle)}>
                Keep your account secure by using a strong password.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.changePasswordBtn}
            onClick={() => setIsPasswordOpen(true)}
          >
            Change Password
          </button>
        </section>

        <section className={styles.dangerCard}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerIconWrap}>
              <AlertTriangle size={18} />
            </div>
            <div className={styles.dangerText}>
              <p className={clsx('text-base-tight', styles.dangerTitle)}>Delete Account</p>
              <p className={clsx('text-micro', styles.dangerSubtitle)}>
                Permanently remove your account and all data.
              </p>
            </div>
          </div>
          <button type="button" className={styles.deleteBtn} onClick={() => setIsDeleteOpen(true)}>
            Delete
          </button>
        </section>

        <div className={styles.tabsBar} role="tablist">
          <span
            className={styles.tabSlider}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            aria-hidden="true"
          />

          {PROFILE_TABS.map(({ id, label }) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={clsx('text-micro', styles.tabBtn, activeTab === id && styles.tabBtnActive)}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div key={activeTab} className={styles.tabContent}>
          {activeTab === 'overview' && (
            <Overview onNavigateToReviews={() => setActiveTab('reviews')} />
          )}
          {/* {activeTab === 'watchlist' && <WatchlistTab />}
          {activeTab === 'watched' && <WatchedTab />}
          {activeTab === 'reviews' && <Reviews />} */}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSave={handleProfileUpdate}
      />

      <OttModal
        isOpen={isOttOpen}
        onClose={() => setIsOttOpen(false)}
        selectedOtts={profile.preferredOtts ?? []}
        onToggleOtt={handleToggleOtt}
      />

      <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />

      <DeleteAccountModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} profile={profile} />
    </>
  );
}
