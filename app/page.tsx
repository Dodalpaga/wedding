import Hero from '@/components/Hero';
import InfoSection from '@/components/InfoSection';
import Footer from '@/components/Footer';
import Trailing from '@/components/Tailing';

export default function Home() {
  return (
    <main>
      <Trailing />
      <Hero />
      <InfoSection />
      <Footer />
    </main>
  );
}
