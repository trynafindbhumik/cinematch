'use client';

import {
  Code,
  GitPullRequest,
  MessageSquare,
  Bug,
  Film,
  Palette,
  Star,
  Users,
  Github,
  BookOpen,
} from 'lucide-react';
import React from 'react';

import styles from './Contribute.module.css';

const STEPS = [
  {
    num: '01',
    Icon: Code,
    title: 'Fork & Clone',
    desc: 'Fork the repository on GitHub and clone it to your local machine. Create a descriptive branch for your contribution — e.g. feat/improved-swipe-animation or fix/watchlist-sort-bug.',
  },
  {
    num: '02',
    Icon: GitPullRequest,
    title: 'Pick an Issue',
    desc: 'Browse our open issues on GitHub. Look for tags like "good first issue" for beginner-friendly tasks, or "help wanted" for features where we actively need contributions. Comment to claim an issue before starting.',
  },
  {
    num: '03',
    Icon: MessageSquare,
    title: 'Submit a Pull Request',
    desc: 'Open a pull request with a clear title, description of your changes, and screenshots or screen recordings where relevant. Reference any related issues with "Closes #123". Our team reviews all PRs within 5 working days.',
  },
];

const WAYS = [
  {
    Icon: Code,
    title: 'Frontend Development',
    desc: 'Build new features, improve performance, or fix UI bugs. We use Next.js 16, React 19, and CSS Modules.',
  },
  {
    Icon: Code,
    title: 'Backend & AI',
    desc: 'Work on our recommendation engine, API performance, or data pipeline. Python, Node.js, and PostgreSQL.',
  },
  {
    Icon: Bug,
    title: 'Bug Reports',
    desc: 'Found something broken? File a detailed bug report with steps to reproduce. Clear reports are contributions too.',
  },
  {
    Icon: Palette,
    title: 'Design',
    desc: 'Help improve our UI/UX with Figma mockups, accessibility improvements, or animation ideas.',
  },
  {
    Icon: Film,
    title: 'Film Curation',
    desc: 'Suggest films missing from our catalogue, improve metadata accuracy, or write editorial descriptions.',
  },
  {
    Icon: BookOpen,
    title: 'Documentation',
    desc: 'Improve our developer docs, write tutorials, or translate existing documentation into other languages.',
  },
  {
    Icon: Star,
    title: 'Testing & QA',
    desc: 'Write unit tests, improve test coverage, or manually test new features across devices and browsers.',
  },
  {
    Icon: Users,
    title: 'Community Support',
    desc: 'Help other users in our Discord, answer GitHub discussions, or moderate community film lists.',
  },
];

export default function ContributeComponent() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroDots} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>Open Source</span>
            <h1 className={styles.heroTitle}>
              Build CineMatch
              <br />
              With <em>Us</em>
            </h1>
            <p className={styles.heroDesc}>
              CineMatch is built by movie lovers, for movie lovers. We welcome contributions from
              developers, designers, film critics, and anyone passionate about improving how people
              discover cinema.
            </p>
            <div className={styles.heroActions}>
              <a
                href="https://github.com/trynafindbhumik/cinematch"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryBtn}
              >
                <Github size={15} aria-hidden="true" />
                View on GitHub
              </a>
              <a href="mailto:contribute@cinematch.app" className={styles.ghostBtn}>
                <MessageSquare size={14} aria-hidden="true" />
                Get in Touch
              </a>
            </div>
          </div>

          <div className={styles.codeWrap} aria-hidden="true">
            <div className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <div className={styles.codeDot} style={{ background: '#ef4444' }} />
                <div className={styles.codeDot} style={{ background: '#f59e0b' }} />
                <div className={styles.codeDot} style={{ background: '#22c55e' }} />
                <span className={styles.codeHeaderTitle}>terminal</span>
              </div>
              <pre className={styles.codePre}>
                <code>{`<span class="${styles.codeComment}"># 1. Fork & Clone</span>
<span class="${styles.codeCmd}">git clone</span> <span class="${styles.codeString}">https://github.com/trynafindbhumik/cinematch</span>
<span class="${styles.codeCmd}">cd</span> cinematch

<span class="${styles.codeComment}"># 2. Install dependencies</span>
<span class="${styles.codeCmd}">npm install</span>

<span class="${styles.codeComment}"># 3. Create your branch</span>
<span class="${styles.codeCmd}">git checkout -b</span> <span class="${styles.codeString}">feat/your-feature-name</span>

<span class="${styles.codeComment}"># 4. Start the dev server</span>
<span class="${styles.codeCmd}">npm run dev</span>

<span class="${styles.codeComment}"># 5. Make changes, then commit</span>
<span class="${styles.codeCmd}">git commit -m</span> <span class="${styles.codeString}">"feat: add your feature description"</span>

<span class="${styles.codeComment}"># 6. Push and open a Pull Request</span>
<span class="${styles.codeCmd}">git push origin</span> feat/your-feature-name`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.stepsSection}>
        <div className={styles.stepsInner}>
          <span className={styles.sectionLabel}>How to Contribute</span>
          <h2 className={styles.sectionTitle}>
            Three Steps to Your
            <br />
            First <em>Pull Request</em>
          </h2>
          <div className={styles.stepsGrid} role="list">
            {STEPS.map(({ num, Icon, title, desc }) => (
              <article key={num} className={styles.stepCard} role="listitem">
                <span className={styles.stepNum} aria-hidden="true">
                  {num}
                </span>
                <div className={styles.stepIconWrap}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.waysSection}>
        <div className={styles.waysInner}>
          <span className={styles.sectionLabel}>Ways to Help</span>
          <h2 className={styles.sectionTitle}>
            You Don&lsquo;t Have to
            <br />
            Code to <em>Contribute</em>
          </h2>
          <div className={styles.waysGrid} role="list">
            {WAYS.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.wayCard} role="listitem">
                <div className={styles.wayIconWrap}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className={styles.wayContent}>
                  <h3 className={styles.wayTitle}>{title}</h3>
                  <p className={styles.wayDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
