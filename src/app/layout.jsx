import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal'],
});

export const metadata = {
  title: 'CineMatch',
  description: 'Created By Bhumik Jain',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
