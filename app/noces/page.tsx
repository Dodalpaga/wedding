import type { Metadata } from 'next';
import NocesJourney from './NocesJourney';

export const metadata: Metadata = {
  title: 'À deux, ailleurs — Voyage de noces au Japon',
  description: 'Un carnet de voyage animé au fil du scroll, de Toulouse aux scènes du Japon, jusqu’à une carte 3D interactive du Kinkakuji.',
};

export default function NocesPage() {
  return <NocesJourney />;
}
