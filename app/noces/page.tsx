import type { Metadata } from 'next';
import NocesVoyage from './NocesVoyage';

export const metadata: Metadata = {
  title: 'Notre voyage de noces — Tokyo, Nara, Osaka, Okinawa',
  description: 'Un carnet de voyage qui alterne néons et papier washi : Tokyo, un shinkansen, Nara, un torii, Osaka, puis une plongée vers Okinawa.',
};

export default function NocesPage() {
  return <NocesVoyage />;
}
