import type { Metadata } from 'next';
import NocesJourney from './NocesJourney';

export const metadata: Metadata = {
  title: 'Voyage de noces — De Toulouse à Tokyo',
  description: 'De Toulouse au Japon : un globe, des nuages, Littlest Tokyo, une visite du restaurant Inakaya et une carte du Kinkakuji en trois dimensions.',
};

export default function NocesPage() {
  return <NocesJourney />;
}
