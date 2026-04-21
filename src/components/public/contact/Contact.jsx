'use client';

import { Mail, MessageCircle, MapPin, Zap, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import styles from './Contact.module.css';

const SUBJECTS = ['General', 'Support', 'Partnership', 'Press', 'Privacy', 'Bug Report'];

const INFO_CARDS = [
  {
    Icon: Mail,
    label: 'General',
    title: 'Say Hello',
    value: 'admincinematch@gmail.com',
    href: 'mailto:admincinematch@gmail.com',
  },
  {
    Icon: MessageCircle,
    label: 'Support',
    title: 'Get Help',
    value: 'admincinematch@gmail.com',
    href: 'mailto:admincinematch@gmail.com',
  },
  {
    Icon: Zap,
    label: 'Partnerships',
    title: 'Work Together',
    value: 'admincinematch@gmail.com',
    href: 'mailto:admincinematch@gmail.com',
  },
  {
    Icon: MapPin,
    label: 'Location',
    title: 'Where We Are',
    plain: 'Remote-first\nIndia · Worldwide',
  },
];

const FAQS = [
  {
    q: 'How quickly do you respond?',
    a: 'Our team typically replies within 48 hours on weekdays. Privacy and security matters get priority handling.',
  },
  {
    q: 'I found a bug — what should I do?',
    a: 'Use the Bug Report subject or email admincinematch@gmail.com directly. Screenshots and steps to reproduce help a lot.',
  },
  {
    q: 'Can I request a feature?',
    a: 'Absolutely. We read every message. Feature requests go straight to our product backlog.',
  },
];

export default function ContactComponent() {
  const [subject, setSubject] = useState('General');
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero} aria-label="Contact CineMatch">
        <div className={styles.heroInner}>
          <span className={styles.badge}>Get in Touch</span>
          <h1 className={styles.heroTitle}>
            Let&apos;s talk
            <br />
            <em>cinema.</em>
          </h1>
          <div className={styles.heroRule} aria-hidden="true" />
        </div>
      </section>

      <div className={styles.infoRail} role="list" aria-label="Contact options">
        {INFO_CARDS.map(({ Icon, label, title, value, href, plain }) => (
          <div key={label} className={styles.infoCard} role="listitem">
            <div className={styles.infoCardIcon}>
              <Icon size={17} aria-hidden="true" />
            </div>
            <div>
              <p className={styles.infoCardLabel}>{label}</p>
              <p className={styles.infoCardTitle}>{title}</p>
            </div>
            {href ? (
              <a href={href} className={styles.infoCardValue}>
                {value}
              </a>
            ) : (
              <p className={styles.infoCardPlain} style={{ whiteSpace: 'pre-line' }}>
                {plain}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className={styles.main}>
        {/* Form */}
        <div className={styles.formWrap}>
          {sent ? (
            <div className={styles.successState} role="status">
              <div className={styles.successCheck} aria-hidden="true">
                <CheckCircle size={30} />
              </div>
              <h2 className={styles.successTitle}>Message sent.</h2>
              <p className={styles.successText}>
                Thanks for reaching out — we&apos;ll be back in touch at{' '}
                <strong>{formData.email}</strong> within 48 hours.
              </p>
              <Link href="/" className={styles.successBackBtn}>
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <h2 className={styles.formHeading}>Send a message</h2>
              <p className={styles.formSubheading}>
                Fill in the form below and our team will get back to you shortly.
              </p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Meera Pillai"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.subjectGroup}>
                  <p className={styles.formLabel}>Subject</p>
                  <div className={styles.subjectPills} role="group" aria-label="Select a subject">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.subjectPill} ${subject === s ? styles.subjectPillActive : ''}`}
                        onClick={() => setSubject(s)}
                        aria-pressed={subject === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what's on your mind…"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.submitRow}>
                  <button type="submit" className={styles.submitBtn}>
                    <Send size={13} aria-hidden="true" />
                    Send Message
                  </button>
                  <p className={styles.submitNote}>
                    We reply within
                    <br />
                    48 hours on weekdays.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.responseCard}>
            <div className={styles.responseCardDot} />
            <p className={styles.responseCardText}>
              <strong>Average response time:</strong> under 48 hours on weekdays.
            </p>
          </div>

          <div className={styles.sideCard}>
            <p className={styles.sideCardLabel}>Common Questions</p>
            <div className={styles.faqList}>
              {FAQS.map(({ q, a }) => (
                <div key={q} className={styles.faqItem}>
                  <p className={styles.faqQuestion}>{q}</p>
                  <p className={styles.faqAnswer}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
