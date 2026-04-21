import { Mail } from 'lucide-react';

import sharedStyles from '../Shared.module.css';

import styles from './CodeOfConduct.module.css';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Be Welcoming',
    tag: 'Inclusivity',
    desc: 'Use language that is welcoming and inclusive. Consider how your words might be received by people with different backgrounds, identities, and experiences. Newcomers and less experienced contributors deserve the same respect as veterans.',
  },
  {
    num: '02',
    title: 'Be Respectful',
    tag: 'Respect',
    desc: 'Disagreements happen. Respectful disagreement is healthy and expected. Attack the idea, never the person. Dismissive or condescending responses are not acceptable, even when directed at an opinion you strongly disagree with.',
  },
  {
    num: '03',
    title: 'Be Empathetic',
    tag: 'Empathy',
    desc: 'Understand that everyone comes to this community with different life circumstances. What is obvious to one person may not be to another. Assume good intent and ask clarifying questions before drawing conclusions.',
  },
  {
    num: '04',
    title: 'Accept Constructive Criticism',
    tag: 'Growth',
    desc: 'We all have room to grow. Accept feedback gracefully — whether about a contribution, a film review, or community behaviour. Offer feedback constructively, with specific examples and forward-looking suggestions.',
  },
  {
    num: '05',
    title: 'Focus on What Is Best for the Community',
    tag: 'Community First',
    desc: 'Personal preferences are important, but community health takes precedence. When in doubt, prioritise the experience of the whole community over individual gain or recognition.',
  },
];

const ENFORCEMENT = [
  {
    severity: 'low',
    title: 'Correction',
    desc: 'Private written warning. Clarity on why the behaviour was inappropriate, and a request to change it.',
  },
  {
    severity: 'medium',
    title: 'Temporary Suspension',
    desc: 'Temporary ban from community interactions for a defined period. No contact with involved parties.',
  },
  {
    severity: 'high',
    title: 'Permanent Ban',
    desc: 'Permanent removal from all community interactions for sustained, targeted, or severe violations.',
  },
];

export default function CodeOfConductComponent() {
  return (
    <div className={sharedStyles.page}>
      <div className={sharedStyles.pagePadding}>
        <div className={sharedStyles.grain} aria-hidden="true" />
        <div className={sharedStyles.glowLeft} aria-hidden="true" />
        <div className={sharedStyles.glowRight} aria-hidden="true" />

        <div className={styles.wrapper}>
          <div className={styles.hero}>
            <span className={styles.eyebrow}>Community</span>
            <h1 className={styles.heroTitle}>
              Code of <em>Conduct</em>
            </h1>

            <div className={styles.pledgeBlock}>
              <div className={styles.pledgeLeft}>
                <span className={styles.pledgeLabel}>Our Commitment</span>
                <div className={styles.pledgeStats}>
                  <div className={styles.pledgeStat}>
                    <span className={styles.pledgeStatValue}>48h</span>
                    <span className={styles.pledgeStatLabel}>Response Time</span>
                  </div>
                  <div className={styles.pledgeStat}>
                    <span className={styles.pledgeStatValue}>Zero</span>
                    <span className={styles.pledgeStatLabel}>Tolerance Policy</span>
                  </div>
                  <div className={styles.pledgeStat}>
                    <span className={styles.pledgeStatValue}>100%</span>
                    <span className={styles.pledgeStatLabel}>Anonymous Reports</span>
                  </div>
                </div>
              </div>

              <div className={styles.pledgeRight}>
                <blockquote className={styles.pledgeQuote}>
                  &ldquo;CineMatch is dedicated to providing a welcoming, inclusive, and
                  harassment-free experience for everyone — regardless of age, body size, ability,
                  ethnicity, gender identity, or background. We expect all community members to
                  uphold these standards in all spaces.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          <section className={styles.principlesSection} aria-labelledby="principles-heading">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>How We Behave</span>
              <h2 id="principles-heading" className={styles.sectionTitle}>
                Five Principles
              </h2>
            </div>
            <div className={styles.principlesList} role="list">
              {PRINCIPLES.map(({ num, title, tag, desc }) => (
                <div key={num} className={styles.principle} role="listitem">
                  <span className={styles.principleNum} aria-hidden="true">
                    {num}
                  </span>
                  <div className={styles.principleContent}>
                    <h3 className={styles.principleTitle}>{title}</h3>
                    <p className={styles.principleDesc}>{desc}</p>
                    <span className={styles.principleTag}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.enforcementSection} aria-labelledby="enforcement-heading">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Consequences</span>
              <h2 id="enforcement-heading" className={styles.sectionTitle}>
                Enforcement
              </h2>
            </div>

            <div className={styles.enforcementGrid}>
              {ENFORCEMENT.map(({ severity, title, desc }) => (
                <div key={severity} className={styles.enfCard} data-severity={severity}>
                  <span className={styles.enfSeverity}>{severity} severity</span>
                  <h3 className={styles.enfTitle}>{title}</h3>
                  <p className={styles.enfDesc}>{desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.reportSection}>
              <div className={styles.reportText}>
                <p className={styles.reportTitle}>Report a Violation</p>
                <p className={styles.reportDesc}>
                  All reports are handled confidentially. We take every report seriously.
                </p>
              </div>
              <a href="mailto:conduct@cinematch.app" className={styles.reportBtn}>
                <Mail size={14} />
                conduct@cinematch.app
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
