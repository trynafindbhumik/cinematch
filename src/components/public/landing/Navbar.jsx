'use client';

import { Film, Menu, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#swipe', label: 'The Swipe' },
];

const scrollToSection = (href, closeMenu) => {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) {
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (closeMenu) closeMenu();
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav
        className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.container}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={styles.logo}
            aria-label="CineMatch home"
          >
            <Film className={styles.logoIcon} size={21} aria-hidden="true" />
            <span className={styles.logoText}>CineMatch</span>
          </button>

          <div className={styles.links} role="menubar">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => scrollToSection(href)}
                className={styles.link}
                role="menuitem"
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href="/login" className={styles.loginLink}>
              Log In
            </Link>
            <Link href="/signup" className={styles.ctaBtn}>
              Get Started
            </Link>

            <button
              className={styles.menuBtn}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!isMenuOpen}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav className={styles.mobileNav}>
          {NAV_LINKS.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => scrollToSection(href, () => setIsMenuOpen(false))}
              className={styles.mobileLink}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.mobileCtas}>
          <Link
            href="/login"
            className={styles.mobileLoginBtn}
            onClick={() => setIsMenuOpen(false)}
          >
            Log In
          </Link>
          <Link href="/signup" className={styles.mobileCtaBtn} onClick={() => setIsMenuOpen(false)}>
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  );
};
