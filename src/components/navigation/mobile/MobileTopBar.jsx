import clsx from 'clsx';
import { Film } from 'lucide-react';

import styles from './MobileNavigation.module.css';

export default function MobileTopBar() {
  return (
    <header className={styles.mobileTopBar}>
      <div className={styles.mobileLogoMark} aria-hidden="true">
        <Film size={16} />
      </div>
      <span className={clsx('text-2xl', styles.mobileLogoText)}>CineMatch</span>
    </header>
  );
}
