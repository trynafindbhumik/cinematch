import { cookies } from 'next/headers';

import MobileNav from '@/components/navigation/mobile/MobileNav';
import MobileTopBar from '@/components/navigation/mobile/MobileTopBar';
import Sidebar from '@/components/navigation/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

import styles from './protected-layout.module.css';

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get('cinematch:sidebar-collapsed')?.value;
  const initialCollapsed = collapsed === 'true';

  return (
    <SidebarProvider initialCollapsed={initialCollapsed}>
      <div className={styles.appContainer}>
        <Sidebar />

        <div className={styles.contentWrap}>
          <MobileTopBar />

          <main className={styles.mainContent}>{children}</main>

          <MobileNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
