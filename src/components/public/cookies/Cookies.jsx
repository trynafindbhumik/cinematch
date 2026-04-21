'use client';

import {
  Cookie,
  Settings,
  BarChart3,
  Clock,
  Shield,
  RefreshCw,
  Mail,
  Globe,
} from 'lucide-react';
import React from 'react';

import styles from './Cookies.module.css';

const COOKIE_TYPES = [
  {
    name: 'Essential',
    desc: 'Required to operate',
    dot: '#059669',
    pillBg: 'rgba(5,150,105,0.1)',
    pillColor: '#059669',
    pillText: 'Always On',
  },
  {
    name: 'Preference',
    desc: 'Remembers your settings',
    dot: '#3b82f6',
    pillBg: 'rgba(59,130,246,0.1)',
    pillColor: '#3b82f6',
    pillText: 'Optional',
  },
  {
    name: 'Analytics',
    desc: 'Anonymised usage data',
    dot: '#f59e0b',
    pillBg: 'rgba(245,158,11,0.1)',
    pillColor: '#d97706',
    pillText: 'Optional',
  },
];

const SECTIONS = [
  {
    Icon: Cookie,
    title: 'What Are Cookies?',
    body: [
      'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently, to remember your preferences, and to provide analytical information to the site owners.',
      'CineMatch uses both session cookies (which expire when you close your browser) and persistent cookies (which remain until they expire or you delete them).',
    ],
  },
  {
    Icon: Settings,
    title: 'Types of Cookies We Use',
    body: [
      'Essential Cookies — These are strictly necessary for the Platform to function. They handle authentication, session management, and security. You cannot opt out of these while using the Platform.',
      'Preference Cookies — These remember your choices, such as your selected streaming platforms, preferred genres, and UI settings like sidebar state. Disabling these means you will need to re-enter preferences on each visit.',
      'Analytics Cookies — These help us understand how users interact with the Platform in aggregate. All analytics data is anonymised and cannot be linked to any individual user. We use this data solely to improve Platform performance and features.',
    ],
  },
  {
    Icon: BarChart3,
    title: 'How We Use Cookies',
    body: [
      'We use cookies to: keep you logged in securely across sessions, remember your streaming platform preferences for filtered recommendations, measure Platform performance and identify areas for improvement, understand which features are most useful to our users, and provide a consistent experience across devices.',
      'We do not use cookies for cross-site tracking, behavioural advertising, or any purpose beyond operating and improving CineMatch.',
    ],
  },
  {
    Icon: Globe,
    title: 'Third-Party Cookies',
    body: [
      'Some analytics services we use (such as aggregate usage tracking tools) may set their own cookies. These providers are contractually bound to process data only as instructed by us and only for the purposes outlined in this policy.',
      'We do not permit third-party advertising networks to set cookies on CineMatch. If a third-party service sets a cookie you are concerned about, please contact us at privacy@cinematch.app.',
    ],
  },
  {
    Icon: Clock,
    title: 'Cookie Retention',
    body: [
      'Session cookies expire automatically when you close your browser. Persistent cookies remain active for the following periods: Authentication cookies — 30 days (or until you log out), Preference cookies — 12 months, Analytics cookies — 13 months.',
      'You can delete all cookies at any time through your browser settings.',
    ],
  },
  {
    Icon: Settings,
    title: 'Managing Your Cookie Preferences',
    body: [
      'You can control and manage cookies in several ways: through your browser settings (most browsers allow you to block or delete cookies), through our Cookie Preference Centre accessible via the footer of any page, or by deleting all cookies stored by CineMatch.',
      'Please note that blocking essential cookies will prevent you from logging in and using most Platform features. Blocking analytics cookies will not affect your ability to use the Platform.',
    ],
  },
  {
    Icon: Shield,
    title: 'Do Not Track',
    body: [
      'CineMatch honours the Do Not Track (DNT) browser signal. If DNT is enabled in your browser, we will disable all analytics and preference cookies, retaining only the essential cookies required for the Platform to function.',
    ],
  },
  {
    Icon: RefreshCw,
    title: 'Updates to This Policy',
    body: [
      'We may update this Cookie Policy from time to time to reflect changes in our practices or regulatory requirements. We will notify you of any significant changes via email or a notice on the Platform before the changes take effect.',
      'The date at the top of this page indicates when the policy was last revised.',
    ],
  },
  {
    Icon: Mail,
    title: 'Questions?',
    body: [
      'If you have questions about our use of cookies, please contact us at privacy@cinematch.app. We aim to respond within 48 hours.',
    ],
  },
];

export default function CookieComponent() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>

            <span className={styles.badge}>Legal</span>
            <h1 className={styles.heroTitle}>
              Cookie <em>Policy</em>
            </h1>
            <p className={styles.heroDesc}>
              We use cookies to make CineMatch work reliably and to understand how we can improve it. Here is exactly what we use and why.
            </p>
            <div className={styles.heroMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>3</span>
                <span className={styles.metaLabel}>Cookie Types</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>12 mo</span>
                <span className={styles.metaLabel}>Max Retention</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>0</span>
                <span className={styles.metaLabel}>Ad Cookies</span>
              </div>
            </div>
          </div>

          <div className={styles.cookieTypesWrap} role="list">
            {COOKIE_TYPES.map(({ name, desc, dot, pillBg, pillColor, pillText }) => (
              <div key={name} className={styles.cookieTypeCard} role="listitem">
                <div className={styles.cookieTypeLeft}>
                  <div className={styles.cookieTypeDot} style={{ background: dot }} />
                  <div>
                    <p className={styles.cookieTypeName}>{name}</p>
                    <p className={styles.cookieTypeDesc}>{desc}</p>
                  </div>
                </div>
                <span
                  className={styles.cookieTypePill}
                  style={{ background: pillBg, color: pillColor }}
                >
                  {pillText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className={styles.main}>
        {SECTIONS.map(({ Icon, title, body }) => (
          <section key={title} className={styles.section}>
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
            </div>
          </section>
        ))}
      </main>

    </div>
  );
}