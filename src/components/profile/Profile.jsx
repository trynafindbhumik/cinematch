'use client';

import clsx from 'clsx';
import {
  Camera,
  Pencil,
  Mail,
  Star,
  Plus,
  X,
  Lock,
  AlertTriangle,
  AlertCircle,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import ChangeEmailModal from '@/components/elements/modals/changeEmailModal/ChangeEmailModal';
import ChangePasswordModal from '@/components/elements/modals/changePasswordModal/ChangePasswordModal';
import DeleteAccountModal from '@/components/elements/modals/deleteAccountModal/DeleteAccountModal';
import EditProfileModal from '@/components/elements/modals/editProfileModal/EditProfileModal';
import OttModal from '@/components/elements/modals/ottModal/OttModal';
import VerifyEmailModal from '@/components/elements/modals/verifyEmailModal/VerifyEmailModal';
import Overview from '@/components/profile/tabs/overview/Overview';
import Reviews from '@/components/profile/tabs/reviews/Reviews';
import WatchedTab from '@/components/profile/tabs/watched/Watched';
import WatchlistTab from '@/components/profile/tabs/watchlist/Watchlist';
import { ProfileSkeleton, ActionCardSkeleton } from '@/components/ui/skeleton/Skeleton';
import Toggle from '@/components/ui/toggle/Toggle';
import { useGenres, useUserGenres, useAddGenre, useRemoveGenre } from '@/hooks/useGenres';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import {
  useUserStreamingServices,
  useUpdateStreamingServices,
  useRemoveStreamingService,
} from '@/hooks/useStreaming';
import { useToast } from '@/lib/toast/useToast';

import styles from './Profile.module.css';

// Tag display names mapping
const TAG_DISPLAY_NAMES = {
  screen_enthusiast: 'Screen Enthusiast',
  cinema_lover: 'Cinema Lover',
  cinephile: 'Cinephile',
  cinephile_pro: 'Cinephile Pro',
  cinephile_elite: 'Cinephile Elite',
};

// Tag colors
const TAG_COLORS = {
  screen_enthusiast: '#8c7851',
  cinema_lover: '#6b8c42',
  cinephile: '#4a7c59',
  cinephile_pro: '#3d6b8c',
  cinephile_elite: '#8c6b3d',
};

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'watched', label: 'Watched' },
  { id: 'reviews', label: 'Reviews' },
];

export default function ProfileComponent() {
  // Profile state from API
  const {
    data: profileData,
    error: profileError,
    loading: profileLoading,
    mutate: mutateProfile,
  } = useProfile();

  // Genres state from API
  const { data: allGenresData, loading: allGenresLoading } = useGenres();

  const { data: userGenresData, revalidate: revalidateUserGenres } = useUserGenres();

  // Streaming services state from API
  const { data: userStreamingData, mutate: mutateUserStreaming } = useUserStreamingServices();

  // API mutation hooks
  const [, , , updateTrigger] = useUpdateProfile();
  const [, , , addGenreTrigger] = useAddGenre();
  const [, , , removeGenreTrigger] = useRemoveGenre();
  const [, , , updateStreamingTrigger] = useUpdateStreamingServices();
  const [, , , removeStreamingTrigger] = useRemoveStreamingService();
  const { success, info, error: showError } = useToast();

  // Local UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [localSmartSuggest, setLocalSmartSuggest] = useState(false);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOttOpen, setIsOttOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Derive profile from API data
  const profile = useMemo(() => {
    if (!profileData) return null;

    return {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      avatar: profileData.profileUrl,
      isVerified: profileData.isVerified,
      smartSuggest: profileData.smartSuggest,
      tag: profileData.tag,
      publicId: profileData.publicId,
    };
  }, [profileData]);

  const localSelectedGenres = useMemo(() => {
    return Array.isArray(userGenresData) ? userGenresData : [];
  }, [userGenresData]);

  // Derive loading state directly to avoid flicker during revalidation

  const isLoading = profileLoading || allGenresLoading;

  // Sync smart suggest when profile data loads from server
  const effectiveSmartSuggest = profileData?.smartSuggest ?? false;

  // Update indicator when tab changes
  const updateIndicator = useCallback((tabId) => {
    const el = tabRefs.current[tabId];

    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
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

  // Handle profile update from edit modal
  const handleProfileUpdate = useCallback(() => {
    mutateProfile();
  }, [mutateProfile]);

  // Handle smart suggest toggle
  const handleSmartSuggestToggle = useCallback(
    async (newValue) => {
      setLocalSmartSuggest(newValue);

      const data = new FormData();

      data.append('name', profile?.name || '');
      data.append('smartSuggest', String(newValue));

      try {
        await updateTrigger('/v1/profile/me', data);
      } catch {
        setLocalSmartSuggest(profileData?.smartSuggest ?? false);
      }
    },
    [profile?.name, profileData?.smartSuggest, updateTrigger]
  );

  // Called by EditProfileModal after successful save
  const handleSmartSuggestUpdated = useCallback((newValue) => {
    setLocalSmartSuggest(newValue);
  }, []);

  // Handle genre toggle
  const handleToggleGenre = useCallback(
    async (genre) => {
      const currentGenres = localSelectedGenres ?? [];

      const isSelected = currentGenres.some((g) => g.id === genre.id || g.genreId === genre.id);

      try {
        if (isSelected) {
          await removeGenreTrigger(`/v1/genres/${genre.id}`);
          info('Genre removed', 'Genre has been removed from your preferences');
        } else {
          await addGenreTrigger(`/v1/genres/${genre.id}`);
          success('Genre added', 'Your preferences have been updated');
        }
        // Manually revalidate with populateCache: false to preserve existing data
        revalidateUserGenres();
      } catch (err) {
        showError('Failed', err?.message || 'Could not update genre preferences. Please try again');
      }
    },
    [
      localSelectedGenres,
      addGenreTrigger,
      removeGenreTrigger,
      revalidateUserGenres,
      success,
      info,
      showError,
    ]
  );

  // Handle save OTT from modal
  const handleSaveOtt = useCallback(
    async (serviceIds) => {
      try {
        await updateStreamingTrigger('/v1/streaming-services', {
          serviceIds,
        });

        mutateUserStreaming();
      } catch {
        showError('Update failed', 'Could not save streaming preferences');
      }
    },
    [updateStreamingTrigger, mutateUserStreaming, showError]
  );

  // Handle remove OTT
  const handleRemoveOtt = useCallback(
    async (service) => {
      const serviceIdToRemove = service.id || service.sourceId;

      try {
        await removeStreamingTrigger(`/v1/streaming-services/${serviceIdToRemove}`, null, {
          allowEmptyBody: true,
        });

        mutateUserStreaming();
        info('Service removed', 'Streaming service has been removed from your preferences');
      } catch {
        showError('Failed to remove', 'Could not remove this service');
      }
    },
    [removeStreamingTrigger, mutateUserStreaming, info, showError]
  );

  // Handle verification success
  const handleVerificationSuccess = useCallback(() => {
    mutateProfile();
  }, [mutateProfile]);

  // Derive user genre IDs
  const userGenreIds = useMemo(() => {
    return localSelectedGenres?.map((g) => g.id || g.genreId) ?? [];
  }, [localSelectedGenres]);

  // Get tag display info
  const tagInfo = useMemo(() => {
    if (!profile?.tag) return null;

    return {
      name: TAG_DISPLAY_NAMES[profile.tag] || profile.tag,
      color: TAG_COLORS[profile.tag] || '#8c7851',
    };
  }, [profile]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <ProfileSkeleton />
        <ActionCardSkeleton />
        <ActionCardSkeleton />
      </div>
    );
  }

  // Error state
  if (profileError && !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <AlertCircle size={32} className={styles.errorIcon} />

          <h3 className={styles.errorTitle}>Unable to load profile</h3>

          <p className={styles.errorMessage}>
            {profileError?.message || 'Something went wrong. Please try again.'}
          </p>

          <button type="button" className={styles.retryBtn} onClick={() => mutateProfile()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        {/* Profile Info Card */}
        <section className={styles.infoCard}>
          <div className={styles.avatarRow}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>
                {profile?.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    fill
                    sizes="6rem"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
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
                <h1 className={clsx('text-6xl', 'md:h-3xl', styles.profileName)}>
                  {profile?.name || 'Loading...'}
                </h1>
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
                  {profile?.email || '...'}
                </span>

                {/* Verify Email Button - Only for unverified users */}
                {!profile?.isVerified && (
                  <button
                    type="button"
                    className={styles.verifyBtn}
                    onClick={() => setIsVerifyOpen(true)}
                  >
                    <AlertCircle size={12} />
                    Verify Email
                  </button>
                )}
              </div>

              <div className={styles.badgeRow}>
                {profile?.isVerified ? (
                  <span className={styles.badge}>
                    <span className={styles.badgeDot} />
                    Verified Member
                  </span>
                ) : (
                  <span className={clsx(styles.badge, styles.badgeWarning)}>
                    <AlertCircle size={12} />
                    Unverified
                  </span>
                )}
                {tagInfo && (
                  <span className={styles.badge} style={{ '--badge-color': tagInfo.color }}>
                    <Star className={styles.badgeStar} style={{ color: tagInfo.color }} />
                    {tagInfo.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.settingsGrid}>
            {/* Genres Section */}
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <span className={clsx('text-micro', styles.settingsSectionLabel)}>
                  Preferred Genres
                </span>
                <span className={clsx('text-micro', styles.settingsSectionCount)}>
                  {userGenreIds.length} Selected
                </span>
              </div>
              <div className={styles.genreChips}>
                {(allGenresData || [])?.map((genre) => {
                  const isActive = userGenreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      className={`${styles.genreChip} ${isActive ? styles.genreChipActive : ''}`}
                      onClick={() => handleToggleGenre(genre)}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Streaming Services Section */}
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <span className={styles.settingsSectionLabel}>Streaming Services</span>
                <div className={styles.streamToggleRow}>
                  <Toggle
                    label="Smart Suggest"
                    checked={localSmartSuggest ?? effectiveSmartSuggest}
                    onChange={handleSmartSuggestToggle}
                  />
                </div>
              </div>

              <div className={styles.ottChips}>
                {(!userStreamingData?.streamingServices ||
                  userStreamingData.streamingServices.length === 0) && (
                  <div className={styles.ottEmptyState}>
                    <Globe size={20} className={styles.ottEmptyIcon} />
                    <div className={styles.ottEmptyText}>
                      <span className={styles.ottEmptyTitle}>No services selected</span>
                      <span className={styles.ottEmptyDesc}>
                        Add streaming platforms to get personalized recommendations
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.addOttBtnEmpty}
                      onClick={() => setIsOttOpen(true)}
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                )}

                {userStreamingData?.streamingServices?.length > 0 && (
                  <>
                    <div
                      className={clsx(
                        styles.ottServicesRow,
                        !showAllServices && styles.ottServicesCollapsed
                      )}
                    >
                      {userStreamingData?.streamingServices?.map((service) => (
                        <span
                          key={service.id || service.sourceId}
                          className={clsx('text-micro', styles.ottChip)}
                        >
                          <Image
                            src={service.iconUrl}
                            alt={service.name}
                            width={14}
                            height={14}
                            className={styles.ottIcon}
                            unoptimized
                          />
                          {service.name}
                          <button
                            type="button"
                            className={styles.removeOttBtn}
                            onClick={() => handleRemoveOtt(service)}
                            aria-label={`Remove ${service.name}`}
                          >
                            <X size={8} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {userStreamingData?.streamingServices?.length > 3 && (
                      <button
                        type="button"
                        className={styles.ottShowMoreBtn}
                        onClick={() => setShowAllServices(!showAllServices)}
                      >
                        {showAllServices
                          ? 'Show less'
                          : `+${userStreamingData.streamingServices.length - 3} more`}
                      </button>
                    )}

                    <button
                      type="button"
                      className={clsx('text-micro', styles.addOttBtn)}
                      onClick={() => setIsOttOpen(true)}
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Change Password Card */}
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

        {/* Danger Zone Card */}
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

        {/* Tabs */}
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

        {/* Tab Content */}
        <div key={activeTab} className={styles.tabContent}>
          {activeTab === 'overview' && (
            <Overview onNavigateToReviews={() => setActiveTab('reviews')} />
          )}
          {activeTab === 'watchlist' && <WatchlistTab />}
          {activeTab === 'watched' && <WatchedTab />}
          {activeTab === 'reviews' && <Reviews />}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSave={handleProfileUpdate}
        onChangeEmail={() => setIsChangeEmailOpen(true)}
        suggestFromOtt={localSmartSuggest}
        onSmartSuggestUpdated={handleSmartSuggestUpdated}
      />

      <OttModal
        isOpen={isOttOpen}
        onClose={() => setIsOttOpen(false)}
        selectedServices={userStreamingData?.streamingServices ?? []}
        onSave={handleSaveOtt}
      />

      <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        profile={profile}
      />

      <ChangeEmailModal
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        currentEmail={profile?.email}
      />

      <VerifyEmailModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        email={profile?.email}
        onVerified={handleVerificationSuccess}
      />
    </>
  );
}
