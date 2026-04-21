'use client';

import { Film, Twitter, Instagram, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './Header.module.css';

const SOCIALS = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Linkedin, label: 'LinkedIn' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLightPage = pathname === '/about' || pathname === '/privacy';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isLightPage ? styles.light : ''}`}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="CineMatch home">
          <Film size={20} className={styles.logoIcon} aria-hidden="true" />
          <span>CineMatch</span>
        </Link>

        <div className={styles.right}>
          <div className={styles.socials} aria-label="Social media links">
            {SOCIALS.map(({ Icon, label }) => (
              <a key={label} href="#" className={styles.social} aria-label={label}>
                <Icon size={15} aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className={styles.divider} aria-hidden="true" />

          <Link href="/signup" className={styles.ctaBtn}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
