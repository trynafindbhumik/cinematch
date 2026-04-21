'use client';

import Link from 'next/link';
import { useCallback } from 'react';

import sharedStyles from '../Shared.module.css';

import styles from './Terms.module.css';

const SECTIONS = [
  {
    id: 'acceptance',
    num: '01',
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using CineMatch (&quot;the Platform&quot;), you agree to be bound by these
          Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, you may
          not access or use the Platform. These Terms constitute a legally binding agreement between
          you and CineMatch AI (&quot;CineMatch,&quot; &quot;we,&quot; &quot;our,&quot; or
          &quot;us&quot;).
        </p>
        <p>
          We reserve the right to update these Terms at any time. We will notify you of material
          changes by posting a notice on the Platform or by emailing you at the address associated
          with your account. Your continued use of the Platform after changes take effect
          constitutes your acceptance of the revised Terms.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    num: '02',
    title: 'Description of Service',
    content: (
      <>
        <p>
          CineMatch is an AI-powered movie discovery and personal cinema management platform. The
          Platform allows users to discover films through a swipe-based interface, build personal
          watchlists and viewing logs, write and share reviews, and receive AI-generated
          personalised recommendations based on their Taste Profile.
        </p>
        <p>
          CineMatch does not stream or play films. We are a discovery and curation tool only. Links
          to streaming platforms are provided for informational purposes and are subject to each
          platform&apos;s own terms and availability.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    num: '03',
    title: 'User Accounts',
    content: (
      <>
        <p>
          To access certain features of the Platform, you must create an account. You agree to
          provide accurate, current, and complete information during registration and to update your
          information to keep it accurate, current, and complete.
        </p>
        <ul>
          <li>
            You are responsible for maintaining the confidentiality of your account credentials.
          </li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must notify us immediately of any unauthorised use of your account.</li>
          <li>You may not share your account with any other person.</li>
          <li>You must be at least 13 years of age to create an account.</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms, engage in
          fraudulent activity, or remain inactive for an extended period.
        </p>
      </>
    ),
  },
  {
    id: 'conduct',
    num: '04',
    title: 'User Conduct & Acceptable Use',
    content: (
      <>
        <p>You agree to use the Platform only for lawful purposes. You must not:</p>
        <ul>
          <li>Post content that is defamatory, obscene, harassing, or discriminatory.</li>
          <li>Attempt to gain unauthorised access to any part of the Platform or its systems.</li>
          <li>Use automated tools, bots, or scrapers to extract data from the Platform.</li>
          <li>Reproduce, distribute, or resell any Platform content without written permission.</li>
          <li>Submit false or misleading reviews or ratings.</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
          <li>Transmit any malware, viruses, or other harmful code.</li>
          <li>Attempt to reverse-engineer the Platform&apos;s recommendation algorithms.</li>
        </ul>
        <p>
          Violation of these rules may result in immediate account suspension or termination,
          without refund of any fees paid.
        </p>
      </>
    ),
  },
  {
    id: 'ip',
    num: '05',
    title: 'Intellectual Property',
    content: (
      <>
        <p>
          All Platform content — including but not limited to text, graphics, logos, interface
          design, software, and AI models — is owned by CineMatch or its licensors and is protected
          by applicable copyright, trademark, and intellectual property laws.
        </p>
        <p>
          You retain full ownership of content you submit to the Platform, including reviews, lists,
          and profile information. By submitting content, you grant CineMatch a non-exclusive,
          worldwide, royalty-free licence to use, display, and distribute your content solely in
          connection with operating the Platform.
        </p>
        <p>
          Film metadata, posters, and related assets are sourced from licensed third-party
          providers. CineMatch asserts no ownership over third-party intellectual property.
        </p>
      </>
    ),
  },
  {
    id: 'privacy',
    num: '06',
    title: 'Privacy',
    content: (
      <>
        <p>
          Your use of the Platform is also governed by our{' '}
          <Link
            href="/privacy"
            style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
          >
            Privacy Policy
          </Link>
          , which is incorporated into these Terms by reference. By using the Platform, you consent
          to the collection and use of your information as described in the Privacy Policy.
        </p>
        <div className={styles.highlight}>
          We take your privacy seriously. We do not sell your personal data to third parties. Your
          Taste Profile data is used solely to improve your experience on CineMatch.
        </div>
      </>
    ),
  },
  {
    id: 'disclaimers',
    num: '07',
    title: 'Disclaimer of Warranties',
    content: (
      <>
        <p>
          The Platform is provided &quot;as is&quot; and &quot;as available,&quot; without
          warranties of any kind, either express or implied. To the fullest extent permitted by law,
          CineMatch disclaims all warranties, including implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
        <p>
          CineMatch does not warrant that the Platform will be uninterrupted, error-free, secure, or
          free of viruses. Recommendation accuracy is not guaranteed. Film availability on streaming
          platforms may change without notice and is outside our control.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    num: '08',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, CineMatch and its officers, employees,
          agents, and affiliates shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages — including loss of profits, data, or goodwill —
          arising out of or in connection with your use of the Platform.
        </p>
        <p>
          Our total aggregate liability for any claim arising out of or relating to these Terms or
          the Platform shall not exceed the greater of (a) the amounts you have paid to CineMatch in
          the twelve months preceding the claim, or (b) one hundred US dollars (US$100).
        </p>
      </>
    ),
  },
  {
    id: 'indemnification',
    num: '09',
    title: 'Indemnification',
    content: (
      <p>
        You agree to indemnify, defend, and hold harmless CineMatch and its officers, directors,
        employees, agents, and affiliates from and against any claims, liabilities, damages, losses,
        costs, and expenses — including reasonable legal fees — arising out of or in any way
        connected with your access to or use of the Platform, your violation of these Terms, or your
        infringement of any rights of another person or entity.
      </p>
    ),
  },
  {
    id: 'termination',
    num: '10',
    title: 'Termination',
    content: (
      <>
        <p>
          CineMatch may terminate or suspend your account at any time, with or without cause, and
          with or without notice. You may terminate your account at any time by following the
          deletion process in Settings.
        </p>
        <p>
          Upon termination, your right to use the Platform will immediately cease. Provisions that
          by their nature should survive termination — including intellectual property, disclaimers,
          limitations of liability, and governing law — shall continue in effect.
        </p>
      </>
    ),
  },
  {
    id: 'governing',
    num: '11',
    title: 'Governing Law & Dispute Resolution',
    content: (
      <>
        <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
        <p>
          Any dispute, claim, or controversy arising out of or relating to these Terms or the
          Platform shall be resolved through arbitration in accordance with the Arbitration and
          Conciliation Act, 1996. The seat and venue of arbitration shall be New Delhi, India, and
          the proceedings shall be conducted in English.
        </p>
        <p>
          The arbitration shall be conducted by a sole arbitrator appointed by CineMatch, and the
          decision of the arbitrator shall be final and binding on the parties.
        </p>
        <p>
          The parties agree that disputes shall be resolved on an individual basis and not as part
          of any class or representative action, to the extent permitted by applicable law.
        </p>
        <p>
          Nothing in this section shall prevent either party from seeking interim or injunctive
          relief from a court of competent jurisdiction in India.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    num: '12',
    title: 'Contact Information',
    content: (
      <>
        <p>If you have questions or concerns about these Terms, please contact us at:</p>
        <ul>
          <li>
            <strong>Email:</strong> admincinematch@gmail.com
          </li>
          <li>
            <strong>General Inquiries:</strong> admincinematch@gmail.com
          </li>
          <li>
            <strong>Company:</strong> CineMatch AI — Remote-first company
          </li>
        </ul>
        <div className={styles.highlight}>
          These Terms were last updated on 1 April 2026 and are effective as of that date.
        </div>
      </>
    ),
  },
];

export default function TermsOfServiceComponent() {
  const handleTocClick = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  return (
    <div className={sharedStyles.page}>
      <div className={sharedStyles.pagePadding}>
        <div className={sharedStyles.grain} aria-hidden="true" />

        <div className={styles.hero}>
          <div className={styles.heroMeta}>
            <div className={styles.metaRight}>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>Apr 2026</span>
                <span className={styles.metaLabel}>Last Updated</span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>12</span>
                <span className={styles.metaLabel}>Sections</span>
              </div>
            </div>
          </div>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.heroTitle}>
            Terms of <em>Service</em>
          </h1>
          <p className={styles.heroDesc}>
            Please read these Terms carefully before using CineMatch. They govern your rights and
            obligations as a user of our platform. By creating an account or browsing the site, you
            agree to be bound by these Terms.
          </p>
        </div>

        <div className={styles.docLayout}>
          <nav className={styles.toc} aria-label="Terms of Service contents">
            <p className={styles.tocTitle}>Contents</p>
            {SECTIONS.map(({ id, num, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className={styles.tocLink}
                onClick={(e) => handleTocClick(e, id)}
              >
                {num}. {title}
              </a>
            ))}
          </nav>

          <div className={styles.docContent}>
            {SECTIONS.map(({ id, num, title, content }) => (
              <section key={id} id={id} className={styles.section}>
                <span className={styles.sectionNum}>{num}</span>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.sectionBody}>{content}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
