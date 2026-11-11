'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import Aurora from '@/components/Aurora';
import { useReveal, useScrollProgress } from './scroll-effects';
import { NeonIcon, StampArt, type NeonKind, type StampKind } from './NocesArt';
import Scene3D from './Scene3D';
import './noces.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/* ---------- Contenus ---------- */

const NAMES = ['東京', 'Tokyo', '新幹線', 'Shinkansen', '奈良', 'Nara', '鳥居', 'Torii', '大阪', 'Osaka', '温泉', 'Onsen', '抹茶', 'Matcha'];
const FOODS = ['たこ焼き', 'Takoyaki', 'お好み焼き', 'Okonomiyaki', '串カツ', 'Kushikatsu', 'ラーメン', 'Ramen', 'たい焼き', 'Taiyaki', 'おにぎり', 'Onigiri'];

const TOKYO_CARDS: { jp: string; title: string; text: string; icon: NeonKind }[] = [
  { jp: 'ネオン', title: 'Les ruelles', text: 'Se perdre la nuit entre les enseignes, les comptoirs minuscules et les trains qui passent au-dessus de nos têtes.', icon: 'neon' },
  { jp: '居酒屋', title: 'Les izakaya', text: 'Pousser une porte coulissante, s’asseoir au comptoir et commander en montrant les plats des voisins.', icon: 'food' },
  { jp: '電車', title: 'Les trains', text: 'Comprendre (ou pas) le plan du métro, et regarder la ville défiler depuis la fenêtre.', icon: 'rail' },
  { jp: '静寂', title: 'Le calme', text: 'Trouver, au détour d’une avenue, un jardin où l’on n’entend plus que le gravier sous nos pas.', icon: 'zen' },
];

const STAMPS: { kind: StampKind; kanji: string; label: string; shape: 'round' | 'square' }[] = [
  { kind: 'cerf', kanji: '鹿', label: 'Les daims', shape: 'round' },
  { kind: 'torii', kanji: '社', label: 'Le sanctuaire', shape: 'square' },
  { kind: 'repas', kanji: '食', label: 'Les bons repas', shape: 'round' },
  { kind: 'bambou', kanji: '竹', label: 'Les bambous', shape: 'square' },
  { kind: 'lanterne', kanji: '灯', label: 'Les lanternes', shape: 'round' },
  { kind: 'onsen', kanji: '湯', label: 'Les sources chaudes', shape: 'square' },
  { kind: 'montagne', kanji: '山', label: 'La montagne', shape: 'round' },
  { kind: 'mer', kanji: '波', label: 'La mer', shape: 'square' },
];

const WORDS = [
  { jp: '一期一会', romaji: 'ichi-go ichi-e', title: 'Une fois, une rencontre', text: 'Chaque instant est unique et ne se reproduira pas. Nous voulons vivre ce voyage en le sachant.' },
  { jp: '侘寂', romaji: 'wabi-sabi', title: 'La beauté de l’inachevé', text: 'Un bol fêlé, une mousse sur la pierre, un plan qui change. Notre itinéraire restera imparfait.' },
  { jp: '縁', romaji: 'en', title: 'Le lien', text: 'Le fil invisible qui relie les personnes destinées à se croiser. Vous faites partie du nôtre.' },
];

const OSAKA_CARDS: { jp: string; title: string; text: string; icon: NeonKind }[] = [
  { jp: 'たこ焼き', title: 'Les takoyaki', text: 'Des boulettes brûlantes retournées à la pique, qu’on mange trop vite en se brûlant la langue.', icon: 'takoyaki' },
  { jp: 'お好み焼き', title: 'L’okonomiyaki', text: 'Une galette cuite devant nous sur la plaque, avec « ce qu’on aime » dedans.', icon: 'okonomi' },
  { jp: '川', title: 'Le canal', text: 'Marcher le long de l’eau quand les enseignes s’allument et se reflètent partout.', icon: 'canal' },
  { jp: '立ち飲み', title: 'Les comptoirs debout', text: 'Un verre, quelques brochettes, et des conversations avec des inconnus.', icon: 'drink' },
];

/* ---------- Utilitaires ---------- */

/** Longitude, latitude. */
const TOULOUSE: [number, number] = [1.4442, 43.6045];
const TOKYO: [number, number] = [139.6503, 35.6762];

function haversineKm([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2
    + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
const DISTANCE = (Math.round(haversineKm(TOULOUSE, TOKYO) / 10) * 10).toLocaleString('fr-FR');

const formatTime = (zone: string, date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: zone, hour: '2-digit', minute: '2-digit' }).format(date);
const hourIn = (zone: string, date: Date) =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: 'numeric', hourCycle: 'h23' }).format(date));

function momentOfDay(hour: number) {
  if (hour < 6) return 'dort encore';
  if (hour < 11) return 'prend son petit-déjeuner';
  if (hour < 14) return 'passe à table';
  if (hour < 18) return 'flâne en plein après-midi';
  if (hour < 22) return 'commande à dîner';
  return 'rentre se coucher';
}

/* ---------- Morceaux ---------- */

function Marquee({ words, label }: { words: string[]; label: string }) {
  return (
    <div className="fx-marquee" aria-label={label}>
      <div className="fx-marquee-track" aria-hidden="true">
        {[...words, ...words].map((word, i) => <span key={i}>{word}</span>)}
      </div>
    </div>
  );
}

function Stamp({ kind, kanji, label, shape, index }: (typeof STAMPS)[number] & { index: number }) {
  const rotation = [-6, 4, -3, 7, -8, 3, 5, -4][index % 8];
  return (
    <li className="fx-stamp" data-reveal style={{ '--r': `${rotation}deg`, '--d': `${index * 110}ms` } as React.CSSProperties}>
      <svg viewBox="0 0 100 100" className="fx-stamp-ink" role="img" aria-label={`Tampon : ${label}`}>
        {shape === 'round'
          ? <><circle cx="50" cy="50" r="46" className="fx-stamp-border" /><circle cx="50" cy="50" r="41" className="fx-stamp-thin" /></>
          : <><rect x="5" y="5" width="90" height="90" rx="6" className="fx-stamp-border" /><rect x="10" y="10" width="80" height="80" rx="3" className="fx-stamp-thin" /></>}
        <g className="fx-stamp-art" transform="translate(19 8) scale(.62)"><StampArt kind={kind} /></g>
        <text x="50" y="84" className="fx-stamp-kanji" textAnchor="middle" lang="ja">{kanji}</text>
      </svg>
      <span className="fx-stamp-label">{label}</span>
    </li>
  );
}

function NeonCard({ jp, title, text, icon, index }: (typeof TOKYO_CARDS)[number] & { index: number }) {
  return (
    <li className="fx-card" style={{ '--i': index } as React.CSSProperties}>
      <div className="fx-card-art"><NeonIcon kind={icon} /></div>
      <span className="fx-card-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <p className="fx-card-jp" lang="ja">{jp}</p>
      <h3>{title}</h3>
      <p>{text}</p>
    </li>
  );
}

function InkStamp({ text, shape, className }: { text: string; shape: 'round' | 'square'; className: string }) {
  return (
    <span className={`fx-ink-stamp fx-ink-${shape} ${className}`} aria-hidden="true" lang="ja">{text}</span>
  );
}

/* ---------- Page ---------- */

export default function NocesVoyage() {
  const rootRef = useRef<HTMLElement>(null);
  const tokyoRef = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState({ label: '旅 · Le carnet', theme: 'light' });
  const [auroraOn, setAuroraOn] = useState(false);
  const [auroraColors, setAuroraColors] = useState(['#003b4e', '#1c7743', '#003b4e']);
  const [now, setNow] = useState<Date | null>(null);
  useScrollProgress(rootRef);
  useReveal(rootRef, 0.2);

  // Chapitre courant (libellé et thème de la barre haute).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        setChapter({ label: el.dataset.chapter ?? '', theme: el.dataset.theme ?? 'light' });
      }
    }, { rootMargin: '-48% 0px -48% 0px' });
    root.querySelectorAll('[data-chapter]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // L'aurore WebGL ne tourne que lorsque l'ouverture de Tokyo est proche de l'écran.
  useEffect(() => {
    const el = tokyoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setAuroraOn(entry.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const updateColors = () => setAuroraColors(window.innerWidth < 1000
      ? ['#1c7743', '#003b4e']
      : ['#003b4e', '#1c7743', '#003b4e']);
    updateColors();
    window.addEventListener('resize', updateColors);
    return () => window.removeEventListener('resize', updateColors);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const parisHour = now ? hourIn('Europe/Paris', now) : 0;
  const tokyoHour = now ? hourIn('Asia/Tokyo', now) : 0;
  const offset = now ? (tokyoHour - parisHour + 24) % 24 : null;

  return (
    <main ref={rootRef} className="fx-page">
      <svg width="0" height="0" className="fx-defs" aria-hidden="true" focusable="false">
        <filter id="fx-ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </svg>

      <nav className="fx-topbar" data-theme={chapter.theme} aria-label="Navigation">
        <Link href="/" className="fx-pill"><ArrowLeft size={16} aria-hidden="true" /> Accueil</Link>
        <span className="fx-pill fx-chapter" aria-live="polite">{chapter.label}</span>
      </nav>

      {/* ============ Page de garde (washi) ============ */}
      <header className="fx-cover fx-light" data-chapter="旅 · Le carnet" data-theme="light">
        <p className="fx-vertical fx-cover-vertical" lang="ja" aria-hidden="true">旅の始まり</p>
        <div className="fx-cover-center">
          <div className="fx-enso">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <path d="M150 52 C 128 24, 74 20, 46 52 C 18 84, 30 148, 78 168 C 126 188, 176 156, 178 108 C 180 82, 170 68, 160 60" />
            </svg>
            <span className="fx-monogram" role="img" aria-label="Monogramme de Solenne et Dorian"
              style={{ '--logo': `url("${basePath}/SD%20Logo%20white.svg")` } as React.CSSProperties} />
          </div>
          <p className="fx-kicker">Japon · 2027</p>
          <h1 className="fx-cover-title">Notre voyage de noces</h1>
          <p className="fx-cover-lede">
            Tokyo, Nara, Osaka : trois premières envies dans un carnet encore vierge.
            Le reste s’écrira en route.
          </p>
          <span className="fx-seal" aria-hidden="true" lang="ja">結</span>
        </div>
        <a href="#tokyo" className="fx-scroll-hint">
          <span>Commencer le voyage</span>
          <span className="fx-scroll-line" aria-hidden="true" />
        </a>
      </header>

      <Marquee words={NAMES} label="Tokyo, Shinkansen, Nara, Torii, Osaka, Onsen, Matcha" />

      {/* ============ Chapitre 1 — Tokyo (néon) ============ */}
      <section id="tokyo" ref={tokyoRef} className="fx-intro fx-dark" data-progress="view" data-chapter="東京 · Tokyo" data-theme="dark" aria-labelledby="fx-tokyo-title">
        <div className="fx-intro-bg" aria-hidden="true">
          {auroraOn && <Aurora colorStops={auroraColors} blend={0.4} amplitude={0.7} speed={0.2} />}
        </div>
        <span className="fx-wire" aria-hidden="true" lang="ja">東京</span>
        <div className="fx-container fx-intro-copy">
          <p className="fx-eyebrow">第一章 · Chapitre un</p>
          <h2 id="fx-tokyo-title" className="fx-h2">Tokyo, la nuit électrique</h2>
          <p className="fx-lede">
            On atterrit de l’autre côté du monde, les yeux encore pleins du mariage.
            Première étape : une ville immense, qui ne dort jamais vraiment.
          </p>
        </div>
      </section>

      <section className="fx-section fx-dark fx-clocks" data-chapter="東京 · Tokyo" data-theme="dark" aria-labelledby="fx-clocks-title">
        <div className="fx-container">
          <p className="fx-eyebrow" data-reveal>Deux fuseaux, une même histoire</p>
          <h2 id="fx-clocks-title" className="fx-h3" data-reveal>Pendant que vous lirez ceci…</h2>
          <div className="fx-clock-grid">
            <article className="fx-clock" data-reveal>
              <p className="fx-clock-city">Toulouse</p>
              <p className="fx-clock-time">{now ? formatTime('Europe/Paris', now) : '--:--'}</p>
              <p className="fx-clock-caption">La France {now ? momentOfDay(parisHour) : '…'}</p>
            </article>
            <div className="fx-clock-link" data-reveal aria-hidden="true">
              <span>+{offset ?? '…'} h</span>
              <svg viewBox="0 0 200 40"><path d="M5 30 Q100 -10 195 30" /></svg>
              <span>{DISTANCE} km</span>
            </div>
            <article className="fx-clock fx-clock-tokyo" data-reveal>
              <p className="fx-clock-city">Tokyo</p>
              <p className="fx-clock-time">{now ? formatTime('Asia/Tokyo', now) : '--:--'}</p>
              <p className="fx-clock-caption">Le Japon {now ? momentOfDay(tokyoHour) : '…'}</p>
            </article>
          </div>
          <p className="fx-note" data-reveal>
            {offset !== null && <>{offset} heures d’avance et environ {DISTANCE} km à vol d’oiseau : nos messages arriveront souvent à des heures improbables.</>}
          </p>
        </div>
      </section>

      <section className="fx-rail fx-dark" data-progress="pin" data-chapter="東京 · Tokyo" data-theme="dark"
        aria-labelledby="fx-tokyo-cards" style={{ '--count': TOKYO_CARDS.length } as React.CSSProperties}>
        <div className="fx-rail-sticky">
          <div className="fx-container">
            <p className="fx-eyebrow">Ce qui nous attire</p>
            <h2 id="fx-tokyo-cards" className="fx-h3">Quatre envies à Tokyo</h2>
          </div>
          <ol className="fx-rail-track">
            {TOKYO_CARDS.map((card, i) => <NeonCard key={card.title} {...card} index={i} />)}
          </ol>
          <div className="fx-rail-progress" aria-hidden="true"><span /></div>
        </div>
      </section>

      {/* ============ Transition — le shinkansen tire le rideau sur le chapitre 2 ============ */}
      <Scene3D
        kind="train"
        label="Transition : un shinkansen tire le rideau de la nuit de Tokyo et découvre le chapitre Nara"
        chapter="奈良 · Nara"
        theme="light"
        credit={<>Shinkansen N700 : <a href="https://sketchfab.com/3d-models/n700-3000-series-shinkansen-f70820be44e0467d8b1614f2aa3045bd" target="_blank" rel="noopener noreferrer">Layo</a> · CC BY 4.0</>}
        cover={<p className="fx-pass-cap"><span lang="ja">東京</span>Tokyo s’éloigne…</p>}
        reveal={
          <div className="fx-pass-content fx-light fx-nara">
            <div className="fx-container fx-nara-grid">
              <p className="fx-vertical fx-nara-kanji" lang="ja" aria-hidden="true">奈良</p>
              <div>
                <p className="fx-kicker">第二章 · Chapitre deux</p>
                <h2 id="fx-nara-title" className="fx-h2-script">Nara, à pas de daim</h2>
                <p className="fx-body">
                  Changement de rythme. Ici, les daims se promènent librement et saluent
                  d’une petite révérence ceux qui leur tendent un biscuit. On veut ralentir,
                  se lever tôt, marcher sous les arbres et écouter le silence des temples.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <section className="fx-section fx-light fx-stamps" data-chapter="奈良 · Nara" data-theme="light" aria-labelledby="fx-stamps-title">
        <div className="fx-container">
          <div className="fx-head" data-reveal>
            <p className="fx-kicker">御朱印帳 · le carnet</p>
            <h2 id="fx-stamps-title" className="fx-h2-script">Les pages que nous rêvons de remplir</h2>
            <p className="fx-body">
              Dans les gares et les temples, des tampons à l’encre attendent les voyageurs,
              qui les collectionnent dans un petit carnet. Voici nos envies, sans ordre ni horaire.
            </p>
          </div>
          <div className="fx-book">
            <ol className="fx-stamp-grid">
              {STAMPS.map((stamp, i) => <Stamp key={stamp.kind} {...stamp} index={i} />)}
              <li className="fx-stamp fx-stamp-empty" data-reveal style={{ '--r': '0deg', '--d': '880ms' } as React.CSSProperties}>
                <span className="fx-stamp-blank" aria-hidden="true">?</span>
                <span className="fx-stamp-label">À inventer en route</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="fx-section fx-light fx-words" data-chapter="奈良 · Nara" data-theme="light" aria-labelledby="fx-words-title">
        <div className="fx-container">
          <div className="fx-head" data-reveal>
            <p className="fx-kicker">三つの言葉 · trois mots</p>
            <h2 id="fx-words-title" className="fx-h2-script">Ce que nous emportons</h2>
          </div>
          <ol className="fx-word-list">
            {WORDS.map((word) => (
              <li key={word.romaji} className="fx-word" data-reveal>
                <p className="fx-vertical fx-word-jp" lang="ja" aria-hidden="true">{word.jp}</p>
                <div>
                  <p className="fx-word-romaji">{word.romaji}</p>
                  <h3>{word.title}</h3>
                  <p>{word.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ Transition — passage sous le torii, sur le chapitre 3 ============ */}
      <Scene3D
        kind="torii"
        label="Transition : passage sous un torii en bois, qui s’ouvre sur le chapitre Osaka"
        chapter="大阪 · Osaka"
        theme="dark"
        credit={<>Torii et lanternes : <a href="https://sketchfab.com/3d-models/torii-gate-bcad7f0d07984d6b8d5d1f63c7949d84" target="_blank" rel="noopener noreferrer">panrichi</a>, <a href="https://sketchfab.com/3d-models/japanese-stone-lantern-e0417d1e05984727a50f9ab1451d162d" target="_blank" rel="noopener noreferrer">Sahir Virmani</a> · CC BY 4.0</>}
        cover={<p className="fx-pass-cap"><span lang="ja">鳥居</span>Passer sous le torii…</p>}
        reveal={
          <div className="fx-pass-content fx-intro fx-dark fx-osaka">
            <div className="fx-intro-bg fx-osaka-bg" aria-hidden="true" />
            <span className="fx-wire" aria-hidden="true" lang="ja">大阪</span>
            <p className="fx-neon-sign" aria-hidden="true" lang="ja">食い倒れ</p>
            <div className="fx-container fx-intro-copy">
              <p className="fx-eyebrow">第三章 · Chapitre trois</p>
              <h2 id="fx-osaka-title" className="fx-h2">Osaka, manger jusqu’à tomber</h2>
              <p className="fx-lede">
                À Osaka, on dit <em>kuidaore</em> : se ruiner (ou s’écrouler) à force de bien manger.
                Après le calme de Nara, retour aux néons, cette fois avec les baguettes à la main.
              </p>
            </div>
          </div>
        }
      />

      <Marquee words={FOODS} label="Takoyaki, okonomiyaki, kushikatsu, ramen, taiyaki, onigiri" />

      <section className="fx-section fx-dark fx-osaka-cards" data-chapter="大阪 · Osaka" data-theme="dark" aria-labelledby="fx-osaka-cards">
        <div className="fx-container">
          <p className="fx-eyebrow" data-reveal>Le carnet de dégustation</p>
          <h2 id="fx-osaka-cards" className="fx-h3" data-reveal>Quatre envies à Osaka</h2>
          <ol className="fx-grid">
            {OSAKA_CARDS.map((card, i) => (
              <li key={card.title} className="fx-card" data-reveal>
                <div className="fx-card-art"><NeonIcon kind={card.icon} /></div>
                <span className="fx-card-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <p className="fx-card-jp" lang="ja">{card.jp}</p>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ Lettre (washi) ============ */}
      <footer className="fx-section fx-light fx-letter-section" data-chapter="手紙 · La lettre" data-theme="light">
        <article className="fx-letter" data-reveal>
          <p className="fx-kicker">手紙 · une lettre</p>
          <p className="fx-letter-greeting">Chers vous,</p>
          <p>
            Avant le Japon, il y aura le Tarn, une grange aux pierres dorées et vous tous
            autour de nous. C’est ce jour-là qui donne son sens au voyage qui suivra.
          </p>
          <p>
            De Tokyo à Osaka, nous penserons à vous à chaque tampon ajouté au carnet.
            Nous vous rapporterons des histoires, quelques photos floues de ramen et,
            peut-être, l’envie d’y aller à votre tour.
          </p>
          <p className="fx-letter-sign">Solenne &amp; Dorian</p>
          <InkStamp text="東京" shape="round" className="fx-ink-a" />
          <InkStamp text="奈良" shape="square" className="fx-ink-b" />
          <InkStamp text="大阪" shape="round" className="fx-ink-c" />
          <span className="fx-seal fx-seal-letter" aria-hidden="true" lang="ja">結</span>
        </article>
        <div className="fx-end-links">
          <Link href="/" className="fx-button">Retour à l’invitation</Link>
          <a href="#tokyo" className="fx-text-link">Refaire le voyage <ArrowUp size={14} aria-hidden="true" /></a>
        </div>
      </footer>
    </main>
  );
}
