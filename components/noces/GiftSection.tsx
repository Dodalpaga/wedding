import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GiftSection() {
  return (
    <section
      data-scene
      data-label="Notre cadeau"
      tabIndex={-1}
      id="cadeau"
      aria-labelledby="gift-title"
      className="noces-scene noces-gift"
    >
      <div className="honeymoon-container noces-scene-layout">
        <div className="noces-story-panel">
          <h2 id="gift-title" className="font-wedding">
            Un petit bout de notre aventure
          </h2>
          <p>
            Votre présence est notre plus beau cadeau. Si vous souhaitez
            participer à notre voyage de noces, une urne sera disponible le jour
            du mariage.
          </p>
          <p className="noces-step-title">Merci du fond du cœur ❤️</p>
          <p>Solenne &amp; Dorian</p>
          <Link href="/" className="noces-back noces-gift-home">
            <ArrowLeft size={16} aria-hidden="true" /> Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
