import { Footer } from '@/components/public/footer/Footer';
import { Header } from '@/components/public/header/Header';

export default async function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
