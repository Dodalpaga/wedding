'use client';

import { useEffect, useState, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { CalendarDays, MapPin, Car, Sun, ChevronDown, ArrowUpRight, Mail, Camera, Plane } from 'lucide-react';
import { db } from '@/lib/firebase';

const contact = 'mailto:solenne.lamaud@gmail.com,dorian.voydie@gmail.com';
const map = 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x12ae7c9aacde77c7:0x2fc264a84876dbee?sa=X&ved=1t:8290&ictx=111';

function Disclosure({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <details className="landing-disclosure">
      <summary>
        {icon && <span className="text-[var(--secondary)]" aria-hidden="true">{icon}</span>}
        <span className="flex-1">{title}</span>
        <ChevronDown size={18} className="disclosure-chevron shrink-0" aria-hidden="true" />
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  );
}

export default function InfoSection() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadParticipants = async () => {
      try {
        const [codes, statuts] = await Promise.all([
          getDocs(collection(db, 'codes_invitation')),
          getDocs(collection(db, 'statuts')),
        ]);
        const statuses = new Map(statuts.docs.map((entry) => {
          const data = entry.data();
          return [data.nom_membre, data.statut];
        }));
        const confirmed = codes.docs.reduce((total, entry) => {
          const membres: unknown = entry.data().membres;
          if (entry.id.length !== 6 || !Array.isArray(membres)) return total;
          return total + membres.filter((name) => statuses.get(name) === 'accepte').length;
        }, 0);
        if (active) setTotalParticipants(confirmed);
      } catch (err) {
        console.error('Erreur chargement participants:', err);
      }
    };
    loadParticipants();
    return () => { active = false; };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setError('Veuillez entrer votre code d’invitation.');
      return;
    }
    router.push(`/confirmation/?code=${encodeURIComponent(code.trim())}`);
  };

  return (
    <div className="landing-container py-6 sm:py-10">
      <div className="landing-overview grid items-stretch gap-6 md:grid-cols-2">
        <section id="confirmation" aria-labelledby="rsvp-title" className="landing-panel landing-rsvp">
          <p className="landing-eyebrow">On vous garde une place ?</p>
          <h2 id="rsvp-title" className="landing-title">Votre présence</h2>
          <p className="mt-1 text-sm leading-relaxed">Retrouvez votre invitation, confirmez votre présence et indiquez vos préférences alimentaires.</p>
          <p className="mt-3 text-sm font-semibold text-[var(--primary)]">Merci de répondre avant le 31 décembre 2026.</p>
          <form onSubmit={handleSubmit} className="mt-5">
            <label htmlFor="code" className="mb-2 block text-sm font-semibold">Votre code d’invitation</label>
            <input id="code" name="code" type="text" value={code}
              onChange={(event) => { setCode(event.target.value); setError(''); }}
              placeholder="Entrez votre code" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'code-error' : undefined}
              className="w-full rounded-xl border border-[var(--primary)]/25 bg-white px-4 py-3 text-base tracking-wider" />
            {error && <p id="code-error" role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="landing-button mt-3 w-full bg-[var(--primary)] text-white hover:bg-[var(--dark)]">Accéder à mon invitation <ArrowUpRight size={18} aria-hidden="true" /></button>
          </form>
          <div className="mt-5 hidden rounded-xl bg-[var(--accent)]/60 p-4 md:block">
            <h3 className="text-sm font-semibold">Une réponse pour chaque invité</h3>
            <ol className="mt-2 space-y-2 text-sm leading-relaxed">
              <li>1. Choisissez une personne dans votre invitation.</li>
              <li>2. Indiquez sa présence, ses événements et ses besoins particuliers.</li>
            </ol>
            <p className="mt-2 text-xs">Vos réponses restent modifiables à tout moment.</p>
          </div>
          <div className="mt-4 space-y-3 text-center text-xs">
            <p>Vous ne retrouvez pas votre code ? <a href={contact} className="font-semibold underline underline-offset-2">Contactez-nous</a></p>
            {totalParticipants !== null && <p className="text-[var(--secondary)]">{totalParticipants === 0 ? 'Soyez les premiers à confirmer !' : `${totalParticipants} ${totalParticipants === 1 ? 'invité a déjà confirmé' : 'invités ont déjà confirmé'}`}</p>}
            <p className="flex items-center justify-center gap-2 text-slate-600"><Camera size={15} aria-hidden="true" /> Galerie photos · Bientôt disponible</p>
          </div>
        </section>

        <section id="infos" aria-labelledby="infos-title" className="landing-panel landing-practical">
          <p className="landing-eyebrow">Pour préparer votre venue</p>
          <h2 id="infos-title" className="landing-title">L’essentiel</h2>
          <div className="landing-venue mt-3 overflow-hidden rounded-xl border border-[var(--primary)]/10">
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary)]">Le lieu</p>
                <h3 className="mt-1 text-lg font-semibold">Domaine d’en Naudet</h3>
                <p className="mt-1 text-sm">2365 route de Pratviel<br />81220 Teyssode</p>
                <a href={map} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4">Voir l’itinéraire <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a>
              </div>
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/domaine.svg`} alt="Illustration du Domaine d’en Naudet" width={282.1942083897158} height={164.291981017164} className="h-auto w-28 max-w-[40%] shrink-0 object-contain sm:w-32 xl:w-40" />
            </div>
            <div className="border-t border-[var(--primary)]/10 px-4 py-3 text-xs sm:px-5">Cérémonie en extérieur · Parking privé de plus de 100 places</div>
          </div>
          <div className="mt-3 space-y-2">
            <Disclosure title="Le programme du week-end" icon={<CalendarDays size={20} />}>
              <p className="mb-4">Votre invitation précise les moments auxquels nous vous attendons : cérémonie et vin d’honneur, ou festivités du week-end.</p>
              <dl className="space-y-4">
                <div><dt className="font-semibold text-[var(--primary)]">Vendredi · Les retrouvailles</dt><dd>Accueil des voyageurs de loin autour d’un repas improvisé, pour poser les valises et commencer les festivités en douceur.</dd></div>
                <div><dt className="font-semibold text-[var(--primary)]">Samedi · Le grand jour</dt><dd>Cérémonie laïque, vin d’honneur, photos, jeux, repas et soirée dansante.</dd></div>
                <div><dt className="font-semibold text-[var(--primary)]">Dimanche · Le brunch</dt><dd>Un brunch convivial pour prolonger ces beaux moments avant de se quitter.</dd></div>
              </dl>
              <p className="mt-4 text-xs text-[var(--secondary)]">Le programme détaillé est en cours de construction. Nous vous informerons des mises à jour par mail.</p>
            </Disclosure>
            <Disclosure title="Découvrir le domaine" icon={<MapPin size={20} />}>
              <p>Niché entre forêts de chênes centenaires et collines tarnaises, le Domaine d’en Naudet est un havre de paix où le charme de la campagne rencontre l’élégance d’un lieu authentique.</p>
              <p className="mt-3">Une longue allée bordée d’arbres majestueux mène à une cour chaleureuse, une grange aux pierres dorées et des espaces extérieurs baignés de lumière : un écrin parfait pour célébrer avec vous.</p>
            </Disclosure>
            <Disclosure title="Transport et parking" icon={<Car size={20} />}>
              <p>Un parking privé de plus de 100 places est disponible directement sur le domaine.</p>
              <p className="mt-3">Besoin d’aide pour organiser votre transport ? <a href={contact} className="font-semibold underline">Contactez-nous</a> : nous vous mettrons en relation avec des personnes pouvant proposer du covoiturage.</p>
            </Disclosure>
            <Disclosure title="Se préparer pour l’extérieur" icon={<Sun size={20} />}>
              <p>En juillet dans le Tarn, prévoyez de la chaleur. Le domaine offre de nombreux coins d’ombre. La cérémonie et une partie des festivités auront lieu en extérieur : pensez à la crème solaire, aux lunettes de soleil et, pourquoi pas, à un éventail !</p>
            </Disclosure>
          </div>
        </section>
      </div>

      <Link href="/noces/" className="mt-6 flex items-center gap-4 rounded-xl border border-[var(--primary)]/10 bg-[var(--secondary)]/[.06] p-4 text-[var(--primary)] transition-colors hover:bg-[var(--secondary)]/10 sm:p-5">
        <Plane size={24} className="shrink-0 text-[var(--secondary)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Notre voyage de noces au Japon</p>
          <p className="mt-1 text-sm">Un mois à deux : découvrez les premières escales de notre roadtrip.</p>
        </div>
        <ArrowUpRight size={20} className="shrink-0" aria-hidden="true" />
      </Link>

      <section id="faq" aria-labelledby="faq-title" className="mt-8 sm:mt-10">
        <p className="landing-eyebrow">Quelques réponses avant de venir</p>
        <h2 id="faq-title" className="landing-title">Questions fréquentes</h2>
        <div className="mt-3 space-y-2">
          <Disclosure title="Y a-t-il un code vestimentaire ?"><p>Une tenue chic et champêtre, dans laquelle vous vous sentez à l’aise ! Pensez aux chaussures adaptées à l’herbe et évitez simplement le blanc intégral.</p></Disclosure>
          <Disclosure title="Comment indiquer mes allergies ou mon régime alimentaire ?"><p>Un champ est prévu lors de votre confirmation pour vos allergies, intolérances ou régimes particuliers (végétarien, végétalien, sans gluten…). Notre traiteur s’adaptera pour que chacun profite du repas.</p></Disclosure>
          <Disclosure title="Les animaux sont-ils acceptés ?"><p>Nous adorons nos amis à quatre pattes, mais nous avons choisi de ne pas accueillir d’animaux pour garantir le confort de tous. Merci de les confier à des proches pour ce week-end.</p></Disclosure>
        </div>
      </section>
      <section id="contact" aria-label="Nous contacter" className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-[var(--primary)]/15 pt-5 sm:flex-row sm:items-center">
        <div><h2 className="font-semibold">Une autre question ?</h2><p className="mt-1 text-sm">Transport, invitation, petit doute… écrivez-nous !</p></div>
        <a href={contact} className="landing-button border border-[var(--primary)]/20 bg-white text-[var(--primary)]"><Mail size={18} aria-hidden="true" /> Contacter Solenne &amp; Dorian</a>
      </section>
    </div>
  );
}
