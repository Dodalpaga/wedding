'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import AdminDashboardView from '@/components/AdminDashboardView';
import type { AdminGuest } from '@/lib/rsvp-csv';

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let active = true;
    let revision = 0;
    let unsubscribeData: (() => void) | undefined;
    const unsubscribeAuth = auth.onAuthStateChanged(async user => {
      const currentRevision = ++revision;
      unsubscribeData?.();
      unsubscribeData = undefined;
      if (!active) return;
      setAuthenticated(Boolean(user));
      setChecking(false);
      setGuests([]);
      setDataError('');
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try {
        await user.getIdToken(true);
        const invitations = await getDocs(collection(db, 'codes_invitation'));
        if (!active || currentRevision !== revision) return;
        const groups = invitations.docs.filter(entry => entry.id.length === 6 && Array.isArray(entry.data().membres));
        unsubscribeData = onSnapshot(query(collection(db, 'statuts'), orderBy('date_modification', 'desc')), snapshot => {
          if (!active || currentRevision !== revision) return;
          const responses = new Map(snapshot.docs.map(entry => [entry.data().nom_membre, entry.data()]));
          setGuests(groups.flatMap(group => (group.data().membres as string[]).map(nom => {
            const response = responses.get(nom);
            return {
              nom, codeInvitation: group.id, email: response?.email || '',
              statut: response?.statut === 'accepte' || response?.statut === 'refuse' ? response.statut : 'en_attente',
              vendredi_soir: Boolean(response?.vendredi_soir), samedi_soir: Boolean(response?.samedi_soir),
              dimanche_brunch: Boolean(response?.dimanche_brunch), commentaires: response?.commentaires || '',
              dateModification: response?.date_modification?.toDate?.(),
            };
          })));
          setLoading(false);
          setDataError('');
        }, () => {
          if (!active || currentRevision !== revision) return;
          setLoading(false);
          setDataError('Impossible de charger les réponses. Vérifiez votre connexion et vos droits Firebase.');
        });
      } catch {
        if (!active || currentRevision !== revision) return;
        setLoading(false);
        setDataError('Impossible de charger les invitations. Vérifiez votre connexion et vos droits Firebase.');
      }
    });
    return () => { active = false; revision++; unsubscribeAuth(); unsubscribeData?.(); };
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch { setLoginError('Connexion impossible. Vérifiez vos identifiants et votre connexion.'); }
    finally { setLoggingIn(false); }
  };
  const handleLogout = async () => {
    try { await signOut(auth); setPassword(''); }
    catch { setDataError('La déconnexion a échoué. Veuillez réessayer.'); }
  };

  if (checking) return <main className="admin-page grid min-h-screen place-items-center"><p role="status">Vérification de la connexion…</p></main>;
  if (authenticated) return <AdminDashboardView guests={guests} loading={loading} error={dataError} onLogout={handleLogout} />;

  return <main className="admin-page admin-login">
    <section className="admin-panel w-full max-w-md p-6 sm:p-8" aria-labelledby="login-title">
      <Link href="/" className="mb-8 inline-flex min-h-10 items-center gap-2 text-sm text-slate-500 hover:text-[var(--primary)]"><ArrowLeft size={16} aria-hidden="true" />Retour au site</Link>
      <LockKeyhole size={30} className="mb-4 text-[var(--secondary)]" aria-hidden="true" />
      <p className="text-xs uppercase tracking-[.15em] text-slate-500">Solenne &amp; Dorian</p>
      <h1 id="login-title" className="mt-2 text-2xl font-semibold">Le suivi des invités</h1>
      <p className="mt-2 text-sm text-slate-500">Connectez-vous pour consulter les réponses.</p>
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <label className="admin-label block">Adresse e-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required className="admin-input mt-1" /></label>
        <label className="admin-label block">Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required className="admin-input mt-1" /></label>
        {loginError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{loginError}</p>}
        <button type="submit" disabled={loggingIn} className="admin-button w-full bg-[var(--primary)] text-white hover:bg-[var(--dark)] disabled:opacity-50">{loggingIn ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </section>
  </main>;
}
