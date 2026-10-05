'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownUp, Download, LogOut, Search, Moon, Heart, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildRsvpCsv, type AdminGuest } from '@/lib/rsvp-csv';
import { getInvitationAttendance } from '@/lib/admin-stats';

type SortField = 'codeInvitation' | 'nom' | 'statut' | 'vendredi_soir' | 'samedi_soir' | 'dimanche_brunch' | 'dateModification' | 'participation_repas' | 'couchage_sur_place';
const invitationFlags = [
  { key: 'participation_repas', label: 'Repas' },
  { key: 'couchage_sur_place', label: 'Couchage sur place' },
] as const;
const events = [
  { key: 'vendredi_soir', label: 'Vendredi soir', short: 'Vendredi', Icon: Moon },
  { key: 'samedi_soir', label: 'Samedi · Mariage', short: 'Samedi', Icon: Heart },
  { key: 'dimanche_brunch', label: 'Dimanche · Brunch', short: 'Dimanche', Icon: Coffee },
] as const;
const statuses = {
  accepte: { label: 'Confirmé', className: 'admin-status-confirmed' },
  refuse: { label: 'Refusé', className: 'admin-status-declined' },
  en_attente: { label: 'En attente', className: 'admin-status-pending' },
};

function Status({ status }: { status: AdminGuest['statut'] }) {
  const value = statuses[status];
  return <span className={`admin-status ${value.className}`}>{value.label}</span>;
}

function InvitationFlag({ value }: { value: boolean | undefined }) {
  return <span className={value === true ? 'font-semibold text-[var(--secondary)]' : 'text-slate-500'}>
    {value === true ? 'Oui' : value === false ? 'Non' : 'Non renseigné'}
  </span>;
}

function Comment({ text }: { text: string }) {
  if (!text) return <span className="text-slate-400">—</span>;
  if (text.length <= 100 && !/[\r\n]/.test(text)) return <p className="whitespace-pre-wrap break-words">{text}</p>;
  return <details className="admin-comment">
    <summary className="cursor-pointer font-medium text-[var(--secondary)]">Lire le commentaire</summary>
    <p className="mt-2 whitespace-pre-wrap break-words">{text}</p>
  </details>;
}

export default function AdminDashboardView({ guests, onLogout, loading = false, error = '' }: {
  guests: AdminGuest[]; onLogout: () => void; loading?: boolean; error?: string;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('tous');
  const [sort, setSort] = useState<SortField>('nom');
  const [descending, setDescending] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const confirmed = guests.filter(guest => guest.statut === 'accepte');
  const attendance = getInvitationAttendance(guests);
  const filtered = guests.filter(guest =>
    guest.codeInvitation.toLowerCase().includes(code.trim().toLowerCase()) &&
    guest.nom.toLowerCase().includes(name.trim().toLowerCase()) &&
    (status === 'tous' || guest.statut === status),
  ).sort((a, b) => {
    const left = a[sort], right = b[sort];
    const difference = typeof left === 'string' && typeof right === 'string'
      ? left.localeCompare(right, 'fr', { sensitivity: 'base' })
      : Number(left instanceof Date ? left.getTime() : left || 0) - Number(right instanceof Date ? right.getTime() : right || 0);
    return descending ? -difference : difference;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const offset = (currentPage - 1) * pageSize;
  const visible = filtered.slice(offset, offset + pageSize);
  const updateSort = (field: SortField) => {
    setDescending(sort === field ? !descending : false);
    setSort(field);
    setPage(1);
  };
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([buildRsvpCsv(filtered)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsvp_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const sortHeaders: { field: SortField; label: string }[] = [
    { field: 'codeInvitation', label: 'Code' }, { field: 'nom', label: 'Invité' }, { field: 'statut', label: 'Réponse' },
  ];
  const sortButton = (field: SortField, label: string) => <button className="inline-flex min-h-10 items-center gap-2 text-left" onClick={() => updateSort(field)}>
    {label}<ArrowDownUp size={14} aria-hidden="true" /><span className="sr-only">{sort === field ? (descending ? ', tri décroissant' : ', tri croissant') : ', trier'}</span>
  </button>;
  const ariaSort = (field: SortField) => sort === field ? (descending ? 'descending' as const : 'ascending' as const) : 'none' as const;

  return <main className="admin-page">
    <header className="admin-header">
      <div className="admin-container flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <Link href="/" className="mb-3 inline-flex min-h-8 items-center gap-2 text-sm text-white/75 hover:text-white"><ArrowLeft size={15} aria-hidden="true" />Voir le site</Link>
          <p className="text-xs uppercase tracking-[.18em] text-white/65">Solenne &amp; Dorian · 17 juillet 2027</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Le suivi des invités</h1>
        </div>
        <button onClick={onLogout} className="admin-button border border-white/25 text-white hover:bg-white/10"><LogOut size={16} aria-hidden="true" />Déconnexion</button>
      </div>
    </header>
    <div className="admin-container space-y-6 py-6 sm:py-8">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <section aria-label="Vue d’ensemble" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { label: 'Invités', count: guests.length, detail: 'Toutes les invitations', className: '' },
          { label: 'Confirmés', count: confirmed.length, detail: 'Nous rejoignent', className: 'admin-status-confirmed' },
          { label: 'En attente', count: guests.filter(g => g.statut === 'en_attente').length, detail: 'Réponse à venir', className: 'admin-status-pending' },
          { label: 'Refusés', count: guests.filter(g => g.statut === 'refuse').length, detail: 'Ne seront pas présents', className: 'admin-status-declined' },
          { label: 'Repas', count: `${attendance.repas.confirmed} / ${attendance.repas.invited}`, detail: 'Confirmés / invités au repas', className: 'admin-status-confirmed', unknown: attendance.repas.unknown },
          { label: 'Couchage sur place', count: `${attendance.couchage.confirmed} / ${attendance.couchage.invited}`, detail: 'Confirmés / invités à dormir', className: 'admin-status-confirmed', unknown: attendance.couchage.unknown },
        ].map(metric => <div key={metric.label} className="admin-panel min-w-0 p-4 sm:p-5">
          <p className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${metric.className || 'bg-slate-100 text-slate-600'}`}>{metric.label}</p>
          <p className="mt-3 text-2xl font-semibold tabular-nums sm:text-4xl">{loading ? '—' : metric.count}</p>
          <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
          {!loading && !!metric.unknown && <p className="mt-2 text-xs text-amber-800">{metric.unknown} invité{metric.unknown > 1 ? 's' : ''} avec ce choix non renseigné, hors total.</p>}
        </div>)}
      </section>
      <p className="text-xs text-slate-500">Les compteurs repas et couchage comptent les réponses confirmées parmi les invités concernés, sur toutes les pages et indépendamment des filtres.</p>

      <section aria-labelledby="events-title" className="admin-panel p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="events-title" className="font-semibold">Les moments du week-end</h2>
          <p className="text-xs text-slate-500">Présences des invités confirmés</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3 md:gap-8">
          {events.map(({ key, label, Icon }) => {
            const count = confirmed.filter(g => g[key]).length;
            return <div key={key}>
              <div className="flex items-center justify-between gap-2 text-sm"><span className="flex items-center gap-2"><Icon size={17} className="text-[var(--secondary)]" aria-hidden="true" />{label}</span><strong className="tabular-nums">{loading ? '—' : count}</strong></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf2ef]"><div className="h-full rounded-full bg-[var(--secondary)]" style={{ width: `${guests.length ? count / guests.length * 100 : 0}%` }} /></div>
            </div>;
          })}
        </div>
      </section>

      <section aria-labelledby="guests-title" className="admin-panel overflow-hidden">
        <div className="border-b border-[var(--primary)]/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="guests-title" className="text-lg font-semibold">Les réponses</h2><p className="mt-1 text-sm text-slate-500" aria-live="polite">{loading ? 'Chargement des invitations…' : `${filtered.length} invité${filtered.length > 1 ? 's' : ''} sur ${guests.length}`}</p></div>
            <button onClick={exportCsv} disabled={loading || !filtered.length} className="admin-button bg-[var(--primary)] text-white hover:bg-[var(--dark)] disabled:opacity-40"><Download size={17} aria-hidden="true" />Exporter les résultats CSV</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="admin-label">Code d’invitation<div className="relative mt-1"><Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" aria-hidden="true" /><input value={code} onChange={e => { setCode(e.target.value); setPage(1); }} placeholder="Rechercher un code" className="admin-input pl-9" /></div></label>
            <label className="admin-label">Nom de l’invité<input value={name} onChange={e => { setName(e.target.value); setPage(1); }} placeholder="Rechercher un nom" className="admin-input mt-1" /></label>
            <label className="admin-label">Réponse<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="admin-input mt-1"><option value="tous">Toutes les réponses</option><option value="accepte">Confirmés</option><option value="en_attente">En attente</option><option value="refuse">Refusés</option></select></label>
            <button onClick={() => { setCode(''); setName(''); setStatus('tous'); setPage(1); }} className="admin-button self-end border border-[var(--primary)]/15 hover:bg-slate-50">Réinitialiser</button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Repas et couchage indiquent l’invitation du groupe, quelle que soit la réponse individuelle. L’export contient tous les résultats filtrés, sur toutes les pages.</p>
          <label className="admin-label mt-4 block lg:hidden">Trier par<select value={`${sort}:${descending ? 'desc' : 'asc'}`} onChange={e => { const [field, direction] = e.target.value.split(':'); setSort(field as SortField); setDescending(direction === 'desc'); setPage(1); }} className="admin-input mt-1">
            {[...sortHeaders, { field: 'dateModification' as const, label: 'Date' }, ...events.map(e => ({ field: e.key, label: e.label })), ...invitationFlags.map(f => ({ field: f.key, label: f.label }))].flatMap(item => ['asc', 'desc'].map(direction => <option key={`${item.field}:${direction}`} value={`${item.field}:${direction}`}>{item.label} · {direction === 'asc' ? 'croissant' : 'décroissant'}</option>))}
          </select></label>
        </div>

        {!loading && !filtered.length && <div className="p-10 text-center"><p className="font-semibold">Aucun invité à afficher</p><p className="mt-2 text-sm text-slate-500">{guests.length ? 'Essayez un autre filtre ou réinitialisez la recherche.' : 'Les invitations apparaîtront ici une fois chargées.'}</p></div>}
        {!!visible.length && <>
          <div className="admin-table-scroll hidden lg:block" tabIndex={0} role="region" aria-label="Tableau des invités, défilement horizontal si nécessaire">
            <table className="admin-table"><caption className="sr-only">Réponses individuelles, présences au week-end et invitation au repas et au couchage</caption><thead><tr>
              {sortHeaders.map(h => <th key={h.field} scope="col" aria-sort={ariaSort(h.field)}>{sortButton(h.field, h.label)}</th>)}
              <th scope="col">Email</th>
              {events.map(e => <th key={e.key} scope="col" aria-sort={ariaSort(e.key)}>{sortButton(e.key, e.short)}</th>)}
              {invitationFlags.map(f => <th key={f.key} scope="col" aria-sort={ariaSort(f.key)}>{sortButton(f.key, f.label)}</th>)}
              <th scope="col">Commentaires</th><th scope="col" aria-sort={ariaSort('dateModification')}>{sortButton('dateModification', 'Mise à jour')}</th>
            </tr></thead><tbody>{visible.map(g => <tr key={`${g.codeInvitation}-${g.nom}`}>
              <td className="font-mono text-xs text-slate-500">{g.codeInvitation}</td><th scope="row" className="font-semibold">{g.nom}</th><td><Status status={g.statut} /></td><td className="break-words text-slate-600">{g.email || '—'}</td>
              {events.map(e => <td key={e.key} className="text-center"><span className={g[e.key] && g.statut === 'accepte' ? 'font-semibold text-[var(--secondary)]' : 'text-slate-400'}>{g[e.key] && g.statut === 'accepte' ? 'Oui' : '—'}</span></td>)}
              {invitationFlags.map(f => <td key={f.key}><InvitationFlag value={g[f.key]} /></td>)}
              <td className="text-slate-600"><Comment text={g.commentaires} /></td><td className="text-xs text-slate-500">{g.dateModification?.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '—'}</td>
            </tr>)}</tbody></table>
          </div>
          <div className="grid gap-3 bg-[#f8faf9] p-3 sm:grid-cols-2 lg:hidden">{visible.map(g => <article key={`${g.codeInvitation}-${g.nom}`} className="admin-panel min-w-0 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="font-semibold break-words">{g.nom}</p><p className="mt-1 font-mono text-xs text-slate-500">{g.codeInvitation}</p></div><Status status={g.statut} /></div>
            <p className="mt-3 break-all text-sm text-slate-600">{g.email || 'Pas d’e-mail renseigné'}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{invitationFlags.map(f => <div key={f.key}><dt className="text-slate-500">{f.label}</dt><dd className="mt-1"><InvitationFlag value={g[f.key]} /></dd></div>)}</dl>
            <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">{events.map(e => <div key={e.key}><dt className="text-slate-500">{e.short}</dt><dd className="mt-1 font-semibold">{g[e.key] && g.statut === 'accepte' ? 'Oui' : '—'}</dd></div>)}</dl>
            {!!g.commentaires && <div className="mt-4 border-t border-[var(--primary)]/10 pt-3 text-sm"><Comment text={g.commentaires} /></div>}
            <p className="mt-3 text-xs text-slate-400">{g.dateModification ? `Mis à jour le ${g.dateModification.toLocaleDateString('fr-FR')}` : 'Aucune réponse enregistrée'}</p>
          </article>)}</div>
        </>}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--primary)]/10 p-4 text-sm sm:px-5">
          <label className="flex items-center gap-2 text-slate-600">Par page<select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="admin-input w-auto"><option>20</option><option>50</option><option>100</option></select></label>
          <p className="text-slate-500">{filtered.length ? `${offset + 1}–${offset + visible.length} sur ${filtered.length}` : '0 résultat'}</p>
          <div className="flex items-center gap-3"><button aria-label="Page précédente" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="admin-button border border-[var(--primary)]/15 disabled:opacity-30"><ChevronLeft size={18} /></button><span className="tabular-nums">{currentPage} / {pages}</span><button aria-label="Page suivante" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} className="admin-button border border-[var(--primary)]/15 disabled:opacity-30"><ChevronRight size={18} /></button></div>
        </div>
      </section>
    </div>
  </main>;
}
