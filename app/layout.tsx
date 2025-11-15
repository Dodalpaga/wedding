import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solenne & Dorian - Notre Mariage',
  description: 'Célébrez avec nous notre mariage le 17 Juillet 2027',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
