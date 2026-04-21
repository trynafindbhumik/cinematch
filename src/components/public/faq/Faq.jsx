'use client';

import { Search, Plus, Mail } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useMemo } from 'react';

import styles from './Faq.module.css';

const FAQS = [
  {
    category: 'Discovery',
    q: 'How does CineMatch recommend films?',
    a: 'CineMatch uses a machine learning model trained on over 2,000 cinematic data points per film — narrative arc, pacing, director lineage, lighting palette, thematic weight, and more. Every swipe you make (Love, Like, Dislike, etc.) refines your personal Taste Profile, making recommendations more precise over time. Most users notice a significant improvement after their first 20–30 ratings.',
  },
  {
    category: 'Discovery',
    q: 'What are the six swipe gestures?',
    a: 'CineMatch offers six distinct signals: Love (adds to watchlist and strongly influences recommendations), Like (positive signal, refines your profile), Watched (logs to your collection without a preference signal), Skip (neutral pass, no effect), Dislike (reduces similar content in your feed), and Hate (removes that film and similar titles permanently from your recommendations).',
  },
  {
    category: 'Discovery',
    q: 'What is the "For You" AI feature?',
    a: '"For You" generates a personalised set of film picks on demand by reading your full Taste Profile. You get three attempts per week, each refreshable for a new set of suggestions. The page also features five editorially curated picks updated every Monday.',
  },
  {
    category: 'Discovery',
    q: 'Can I undo a swipe?',
    a: 'Yes. There is an undo button that lets you reverse your most recent swipe. This ensures accidental swipes do not permanently distort your Taste Profile. You can undo one swipe at a time.',
  },
  {
    category: 'Pricing',
    q: 'Is CineMatch free to use?',
    a: 'Yes — all core features are completely free. You can browse and swipe films, build watchlists, log watched films, write reviews, and receive personalised recommendations at no cost. We may introduce optional premium features in the future, but the core discovery experience will always be free.',
  },
  {
    category: 'Pricing',
    q: 'Will you show ads?',
    a: 'No. CineMatch does not show third-party advertisements and never sells your viewing data to advertisers. Our business model is built on delivering a genuinely useful product, not monetising your attention.',
  },
  {
    category: 'Platform',
    q: 'Can I use CineMatch on my phone?',
    a: 'Yes. CineMatch is a fully responsive web application optimised for mobile, tablet, and desktop. Open cinematch.app in your mobile browser — no download required. The swipe interface is designed to feel native on touch devices.',
  },
  {
    category: 'Platform',
    q: 'Which streaming platforms does CineMatch support?',
    a: 'CineMatch integrates with 22+ streaming platforms including Netflix, Amazon Prime Video, Apple TV+, Disney+, HBO Max, Hotstar, Zee5, SonyLIV, JioCinema, and more. You can filter recommendations to only show films available on your specific subscriptions via your Taste Profile settings.',
  },
  {
    category: 'Platform',
    q: 'How accurate are the recommendations initially?',
    a: 'Initial recommendations are based on the genre preferences you set during onboarding. They become meaningfully more precise after your first 20–30 swipes, and significantly sharper after 100. The more you engage, the better the engine understands your cinematic sensibility.',
  },
  {
    category: 'Account',
    q: 'How do I delete my account?',
    a: 'Go to Settings → Account → Delete Account. You will be shown a summary of what will be deleted and given the option to export your data first. Deletion requests are processed within 30 days per our data retention policy. You may also temporarily disable your account instead of permanently deleting it.',
  },
  {
    category: 'Account',
    q: 'Can I export my data?',
    a: 'Yes. From your account settings, you can request a full export of your data — including swipe history, watchlist, watched library, reviews, and taste profile preferences. The export is sent to your registered email address within 48 hours.',
  },
  {
    category: 'Account',
    q: 'Does CineMatch share my data?',
    a: 'We do not sell, rent, or trade your personal information. Limited data may be shared with infrastructure providers (cloud hosting, analytics) under strict confidentiality agreements. See our Privacy Policy for complete details.',
  },
  {
    category: 'Content',
    q: 'Where does your film data come from?',
    a: 'Our film catalogue is powered by licensed data from TMDb (The Movie Database), JustWatch for streaming availability, and editorial curation from our in-house team of film critics. We update streaming availability data daily.',
  },
  {
    category: 'Content',
    q: 'Can I suggest a film that is missing?',
    a: 'Yes — use the "Report Missing Film" option in any film search result page, or email us at admincinematch@gmail.com. Our editorial team reviews all submissions and adds qualifying titles within 5–7 working days.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function FAQComponent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIdx, setOpenIdx] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchSearch =
        !search.trim() ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.badge}>Help Centre</span>
          <h1 className={styles.heroTitle}>
            Frequently Asked
            <br />
            <em>Questions</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Can&apos;t find what you&apos;re looking for? Email us at{' '}
            <a href="mailto:admincinematch@gmail.com">admincinematch@gmail.com</a> — we typically
            respond within 24 hours.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 0' }}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveCategory('All');
            }}
            className={styles.searchInput}
            aria-label="Search FAQ"
          />
        </div>
      </div>

      {!search && (
        <div className={styles.tabsWrap} role="tablist" aria-label="FAQ categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIdx(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <main className={styles.faqWrap} role="tabpanel">
        {filtered.length === 0 ? (
          <p className={styles.noResults}>No results found for &quot;{search}&quot;.</p>
        ) : (
          filtered.map((item, i) => (
            <div
              key={item.q}
              className={`${styles.accordionItem} ${openIdx === i ? styles.accordionOpen : ''}`}
            >
              <button
                className={styles.accordionBtn}
                onClick={() => toggle(i)}
                aria-expanded={openIdx === i}
              >
                <span className={styles.accordionQ}>{item.q}</span>
                <span className={styles.accordionIcon} aria-hidden="true">
                  <Plus size={14} strokeWidth={2.5} />
                </span>
              </button>
              {openIdx === i && (
                <div className={styles.accordionBody}>
                  <p className={styles.accordionA}>{item.a}</p>
                  <span className={styles.accordionTag}>{item.category}</span>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <section className={styles.helpSection}>
        <div className={styles.helpInner}>
          <h2 className={styles.helpTitle}>
            Still need <em>help?</em>
          </h2>
          <p className={styles.helpText}>
            Our support team is made up of real cinephiles who love what they do. Reach out and
            we&apos;ll get back to you within 24 hours.
          </p>
          <Link href="/contact" className={styles.helpBtn}>
            <Mail size={14} aria-hidden="true" />
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
