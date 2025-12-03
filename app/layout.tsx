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
      <head>
        <link
          rel="preload"
          href="/fonts/Wedding.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased select-none">{children}</body>
    </html>
  );
}
