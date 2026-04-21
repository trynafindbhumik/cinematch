import { Film, Twitter, Instagram, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import styles from './Footer.module.css';

const LINK_GROUPS = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'Contribute', href: '/contribute' },
      { label: 'Code of Conduct', href: '/code-of-conduct' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

const SOCIALS = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Linkedin, label: 'LinkedIn' },
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top row */}
        <div className={styles.top}>
          {/* Brand block */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="CineMatch home">
              <Film size={22} className={styles.logoIcon} aria-hidden="true" />
              <span>CineMatch</span>
            </Link>

            <p className={styles.brandDesc}>
              AI-powered cinematic discovery tailored for the modern cinephile. Powered by
              intelligence, curated by passion.
            </p>

            <div className={styles.socials} aria-label="Social media links">
              {SOCIALS.map(({ Icon, label }) => (
                <a key={label} href="#" className={styles.social} aria-label={label}>
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav className={styles.linkGrid} aria-label="Footer navigation">
            {LINK_GROUPS.map(({ title, links }) => (
              <div key={title} className={styles.linkCol}>
                <h3 className={styles.linkColTitle}>{title}</h3>
                {links.map((link) => {
                  const { label, href } = link;
                  return (
                    <Link key={label} href={href} className={styles.link}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} CineMatch AI. Built with precision and cinematic love.
          </p>
          <div className={styles.status} aria-label="System status: online">
            <div className={styles.statusDot} aria-hidden="true" />
            <span>All Systems Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
