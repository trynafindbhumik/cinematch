'use client';

import {
  User,
  Shield,
  Eye,
  Cookie,
  FileText,
  Clock,
  Share2,
  AlertCircle,
  Lock,
  Database,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import React from 'react';

import styles from './Privacy.module.css';

const COMMITMENTS = [
  {
    Icon: Database,
    title: 'Zero Data Sales',
    desc: 'We never sell, rent, or trade your personal information to any third party.',
  },
  {
    Icon: Lock,
    title: 'Encrypted at Rest',
    desc: 'All personal data is encrypted in transit and at rest using AES-256 standards.',
  },
  {
    Icon: CheckCircle2,
    title: 'GDPR Compliant',
    desc: 'EU users have full data portability, right to erasure, and access rights.',
  },
];

const SECTIONS = [
  {
    id: 'collect',
    Icon: User,
    title: 'Information We Collect',
    body: [
      'When you create an account, we collect your name, email address, and chosen preferences. If you sign up via a social login, we receive only the basic profile information you permit.',
      'As you use the Platform, we gather usage data including: film swipe history and reactions (Love, Like, Dislike, etc.), watchlist and watched entries, reviews and star ratings you submit, and device information such as browser type, operating system, and anonymised IP address.',
    ],
    tags: [
      'Name',
      'Email',
      'Swipe history',
      'Watchlist',
      'Reviews',
      'Device info',
      'IP (anonymised)',
    ],
  },
  {
    id: 'use',
    Icon: Eye,
    title: 'How We Use Your Information',
    body: [
      'Your information powers the CineMatch experience. Specifically, we use it to: personalise your film recommendations through our AI taste engine, sync your watchlist and watched library across devices, send important service communications (account security, policy updates), analyse usage patterns in aggregate to improve the Platform, and detect and prevent fraudulent or abusive behaviour.',
      'We do not use your data to show third-party advertising. Ever.',
    ],
  },
  {
    id: 'sharing',
    Icon: Share2,
    title: 'Information Sharing',
    body: [
      'CineMatch does not sell or rent your personal information. We may share limited data with:',
    ],
    list: [
      'Cloud hosting providers (e.g., AWS, Vercel) to operate the Platform',
      'Analytics providers (anonymised aggregate data only)',
      'Payment processors, if you subscribe to a premium plan',
      'Law enforcement, only when required by applicable law',
    ],
    body2:
      'All third-party providers are bound by strict data processing agreements and may not use your data for their own purposes.',
  },
  {
    id: 'security',
    Icon: Shield,
    title: 'Data Security',
    body: [
      'We implement technical and organisational measures to protect your data, including AES-256 encryption at rest, TLS encryption in transit, role-based access control for internal systems, and regular third-party security audits.',
      'While we take every reasonable precaution, no method of transmission over the internet is 100% secure. If you discover a security vulnerability, please disclose it responsibly to admincinematch@gmail.com.',
    ],
  },
  {
    id: 'cookies',
    Icon: Cookie,
    title: 'Cookies & Tracking',
    body: [
      'We use cookies for authentication and session management (essential), preference storage such as your chosen streaming platforms, and anonymised analytics to understand Platform performance. We do not use cookies for cross-site tracking or third-party advertising.',
      'You can manage or delete cookies through your browser settings. Disabling essential cookies will impact your ability to log in. See our Cookie Policy for full details.',
    ],
  },
  {
    id: 'rights',
    Icon: FileText,
    title: 'Your Rights',
    body: [
      'You have the right to: access the personal data we hold about you, correct inaccurate information, request deletion of your account and all associated data, export your data in a portable format, and opt out of non-essential communications.',
      'EU and UK users have additional rights under the GDPR and UK GDPR, including the right to restrict processing and to lodge a complaint with your national data protection authority.',
      'To exercise any of these rights, contact us at admincinematch@gmail.com or use the settings in your profile.',
    ],
  },
  {
    id: 'retention',
    Icon: Clock,
    title: 'Data Retention',
    body: [
      'We retain your data for as long as your account is active. If you delete your account, we will delete or anonymise your personal information within 30 days, except where we are required to retain it by law (e.g., financial records).',
      'Anonymised aggregate data (e.g., which genres are most popular) may be retained indefinitely as it cannot be linked to any individual.',
    ],
  },
  {
    id: 'third-party',
    Icon: AlertCircle,
    title: 'Third-Party Links',
    body: [
      'The Platform contains links to third-party streaming services and film databases. We are not responsible for the privacy practices of these external services. We encourage you to review their privacy policies before providing any personal information.',
      'Streaming platform availability data is sourced from licensed providers and does not involve sharing your personal data with those platforms.',
    ],
  },
  {
    id: 'contact-privacy',
    Icon: Mail,
    title: 'Contact for Privacy',
    body: [
      'For any privacy-related requests or questions, contact our Data Protection team at privacy@cinematch.app. We aim to respond to all requests within 72 hours.',
    ],
  },
];

export default function PrivacyComponent() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGlowLeft} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.heroTitle}>
            Your Privacy,
            <br />
            Our <em>Responsibility</em>
          </h1>
          <p className={styles.heroSubtitle}>
            This policy explains exactly what we collect, why we collect it, and — critically — what
            we never do with it.
          </p>
          <div className={styles.heroCommitments} role="list">
            {COMMITMENTS.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.commitmentCard} role="listitem">
                <div className={styles.commitmentIcon}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <p className={styles.commitmentTitle}>{title}</p>
                <p className={styles.commitmentDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.main}>
        {/* Sections */}
        <main className={styles.sections}>
          {SECTIONS.map(({ id, Icon, title, body, list, body2, tags }) => (
            <section key={id} id={`section-${id}`} className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconWrap}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h2 className={styles.sectionTitle}>{title}</h2>
              </div>
              <div className={styles.sectionBody}>
                {body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {list && (
                  <ul>
                    {list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {body2 && <p style={{ marginTop: '0.875rem' }}>{body2}</p>}
                {tags && (
                  <div className={styles.dataTagsWrap} aria-label="Data types collected">
                    {tags.map((t) => (
                      <span key={t} className={styles.dataTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Privacy at a Glance</p>
            <div className={styles.sideStatList}>
              <div className={styles.sideStat}>
                <span className={styles.sideStatLabel}>Data sold</span>
                <span className={`${styles.sideStatValue} ${styles.zero}`}>Zero</span>
              </div>
              <div className={styles.sideStat}>
                <span className={styles.sideStatLabel}>Deletion turnaround</span>
                <span className={styles.sideStatValue}>30 days</span>
              </div>
              <div className={styles.sideStat}>
                <span className={styles.sideStatLabel}>Security audits/yr</span>
                <span className={`${styles.sideStatValue} ${styles.green}`}>2×</span>
              </div>
              <div className={styles.sideStat}>
                <span className={styles.sideStatLabel}>Ads served</span>
                <span className={`${styles.sideStatValue} ${styles.zero}`}>None</span>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Contact</p>
            <div className={styles.sideContactList}>
              <div className={styles.sideContactItem}>
                <span className={styles.sideContactRole}>Privacy Requests</span>
                <a href="mailto:privacy@cinematch.app" className={styles.sideContactLink}>
                  privacy@cinematch.app
                </a>
              </div>
              <div className={styles.sideContactItem}>
                <span className={styles.sideContactRole}>Security Issues</span>
                <a href="mailto:security@cinematch.app" className={styles.sideContactLink}>
                  security@cinematch.app
                </a>
              </div>
              <div className={styles.sideContactItem}>
                <span className={styles.sideContactRole}>General</span>
                <a href="mailto:hello@cinematch.app" className={styles.sideContactLink}>
                  hello@cinematch.app
                </a>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.gdprBadge}>
              <div className={styles.gdprDot} />
              <span className={styles.gdprText}>GDPR Compliant</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
