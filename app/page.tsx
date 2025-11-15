import Header from '@/components/Header';
import Hero from '@/components/Hero';
import InfoSection from '@/components/InfoSection';
import Footer from '@/components/Footer';
import RSVPForm from '@/components/RSVPForm';
import Accommodation from '@/components/Accommodation';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <InfoSection />
      <RSVPForm />
      <Accommodation />
      <Footer />
    </main>
  );
}
