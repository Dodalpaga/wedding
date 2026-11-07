'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownUp, Download, LogOut, Search, Moon, Heart, Coffee, ChevronLeft, ChevronRight, Pencil, Save } from 'lucide-react';
import { buildRsvpCsv, type AdminGuest, type AdminGuestEdit, type AdminRsvpEdits } from '@/lib/rsvp-csv';
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

function getGuestEdits(guest: AdminGuest): AdminRsvpEdits {
  return {
    statut: guest.statut,
    email: guest.email,
    commentaires: guest.commentaires,
    vendredi_soir: guest.vendredi_soir,
    samedi_soir: guest.samedi_soir,
    dimanche_brunch: guest.dimanche_brunch,
  };
}

function hasGuestChanges(guest: AdminGuest, edits: AdminRsvpEdits) {
  return edits.statut !== guest.statut ||
    edits.email !== guest.email ||
    edits.commentaires !== guest.commentaires ||
    edits.vendredi_soir !== guest.vendredi_soir ||
    edits.samedi_soir !== guest.samedi_soir ||
    edits.dimanche_brunch !== guest.dimanche_brunch;
}

function isValidEmail(value: string) {
  const input = document.createElement('input');
  input.type = 'email';
  input.value = value;
  return input.checkValidity();
}

export default function AdminDashboardView({ guests, onLogout, onSaveGuests, loading = false, error = '' }: {
  guests: AdminGuest[]; onLogout: () => void; onSaveGuests: (changes: AdminGuestEdit[]) => Promise<void>; loading?: boolean; error?: string;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('tous');
  const [sort, setSort] = useState<SortField>('nom');
  const [descending, setDescending] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, AdminRsvpEdits>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
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
  const guestKey = (guest: AdminGuest) => guest.statutDocumentId || guest.nom;
  const guestEdits = (guest: AdminGuest) => drafts[guestKey(guest)] || getGuestEdits(guest);
  const changedGuests = visible.filter(guest => hasGuestChanges(guest, guestEdits(guest)));
  const updateSort = (field: SortField) => {
    if (editing) return;
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
  const sortableHeader = (field: SortField, label: string) => editing ? label : sortButton(field, label);
  const ariaSort = (field: SortField) => sort === field ? (descending ? 'descending' as const : 'ascending' as const) : 'none' as const;
  const startEditing = () => {
    setDrafts(Object.fromEntries(visible.map(guest => [guestKey(guest), getGuestEdits(guest)])));
    setEditing(true);
    setSaveError('');
  };
  const cancelEditing = (confirmDiscard = false) => {
    if (confirmDiscard && changedGuests.length && !window.confirm('Abandonner les modifications non enregistrées ?')) return;
    setEditing(false);
    setDrafts({});
    setSaveError('');
  };
  const updateGuest = (guest: AdminGuest, updates: Partial<AdminRsvpEdits>) => {
    const key = guestKey(guest);
    setDrafts(current => ({ ...current, [key]: { ...(current[key] || getGuestEdits(guest)), ...updates } }));
  };
  const updateStatus = (guest: AdminGuest, value: string) => {
    if (value === 'accepte' || value === 'refuse' || value === 'en_attente') {
      updateGuest(guest, { statut: value });
    }
  };
  const saveEdits = async () => {
    if (!changedGuests.length) return;
    const invalidEmailGuest = changedGuests.find(guest => !isValidEmail(guestEdits(guest).email));
    if (invalidEmailGuest) {
      setSaveError(`Vérifiez l’adresse e-mail de ${invalidEmailGuest.nom} avant d’enregistrer.`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await onSaveGuests(changedGuests.map(guest => ({ guest, edits: guestEdits(guest) })));
      cancelEditing();
    } catch {
      setSaveError('Les modifications n’ont pas pu être enregistrées. Vérifiez votre connexion et vos droits Firebase.');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="admin-container space-y-4 py-4 sm:space-y-5 sm:py-6">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <section aria-label="Vue d’ensemble" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { label: 'Invités', count: guests.length, detail: 'Toutes les invitations', className: '' },
          { label: 'Confirmés', count: confirmed.length, detail: 'Nous rejoignent', className: 'admin-status-confirmed' },
          { label: 'En attente', count: guests.filter(g => g.statut === 'en_attente').length, detail: 'Réponse à venir', className: 'admin-status-pending' },
          { label: 'Refusés', count: guests.filter(g => g.statut === 'refuse').length, detail: 'Ne seront pas présents', className: 'admin-status-declined' },
          { label: 'Repas', count: `${attendance.repas.confirmed} / ${attendance.repas.invited}`, detail: 'Confirmés / invités au repas', className: 'admin-status-confirmed', unknown: attendance.repas.unknown },
          { label: 'Couchage', count: `${attendance.couchage.confirmed} / ${attendance.couchage.invited}`, detail: 'Confirmés / invités à dormir sur place', className: 'admin-status-confirmed', unknown: attendance.couchage.unknown },
        ].map(metric => <div key={metric.label} className="admin-panel min-w-0 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className={`min-w-0 truncate rounded-full px-2 py-1 text-[.68rem] font-semibold sm:text-xs ${metric.className || 'bg-slate-100 text-slate-600'}`}>{metric.label}</p>
            <p className="shrink-0 text-xl font-semibold tabular-nums sm:text-3xl">{loading ? '—' : metric.count}</p>
          </div>
          {metric.unknown
            ? <p className="mt-1 text-[.68rem] leading-snug text-amber-800">{metric.unknown} choix non renseigné{metric.unknown > 1 ? 's' : ''}</p>
            : <p className="sr-only">{metric.detail}</p>}
        </div>)}
      </section>
      <p className="-mt-2 text-[.68rem] text-slate-500">Repas et couchage : confirmés / invités.</p>

      <section aria-labelledby="events-title" className="admin-panel p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="events-title" className="text-sm font-semibold">Présences confirmées par moment</h2>
          <p className="text-xs text-slate-500">sur {confirmed.length}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {events.map(({ key, short, Icon }) => {
            const count = confirmed.filter(g => g[key]).length;
            return <div key={key}>
              <div className="flex items-center justify-between gap-1 text-xs sm:text-sm"><span className="flex min-w-0 items-center gap-1.5"><Icon size={15} className="shrink-0 text-[var(--secondary)]" aria-hidden="true" /><span className="truncate">{short}</span></span><strong className="tabular-nums">{loading ? '—' : count}</strong></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--accent)]"><div className="h-full rounded-full bg-[var(--secondary)]" style={{ width: `${confirmed.length ? count / confirmed.length * 100 : 0}%` }} /></div>
            </div>;
          })}
        </div>
      </section>

      <section aria-labelledby="guests-title" className="admin-panel">
        <div className="border-b border-[var(--primary)]/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="guests-title" className="text-lg font-semibold">Les réponses</h2><p className="mt-1 text-sm text-slate-500" aria-live="polite">{loading ? 'Chargement des invitations…' : editing ? `${visible.length} invité${visible.length > 1 ? 's' : ''} sur cette page` : `${filtered.length} invité${filtered.length > 1 ? 's' : ''} sur ${guests.length}`}</p></div>
            <div className="flex flex-wrap gap-2">
              {!editing && <button onClick={exportCsv} disabled={loading || !filtered.length} className="admin-button border border-[var(--primary)]/15 hover:bg-[var(--accent)] disabled:opacity-40"><Download size={17} aria-hidden="true" />Exporter CSV</button>}
              {!editing && <button type="button" onClick={startEditing} disabled={loading || !visible.length} className="admin-button bg-[var(--primary)] text-white hover:bg-[var(--dark)] disabled:opacity-40"><Pencil size={16} aria-hidden="true" />Mode édition</button>}
            </div>
          </div>
          {editing
            ? <p className="mt-3 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-slate-600">Modifiez directement les champs visibles. Les filtres et la navigation reviendront après l’enregistrement ou l’annulation.</p>
            : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="admin-label">Code d’invitation<div className="relative mt-1"><Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" aria-hidden="true" /><input disabled={editing} value={code} onChange={e => { setCode(e.target.value); setPage(1); }} placeholder="Rechercher un code" className="admin-input pl-9 disabled:opacity-50" /></div></label>
            <label className="admin-label">Nom de l’invité<input disabled={editing} value={name} onChange={e => { setName(e.target.value); setPage(1); }} placeholder="Rechercher un nom" className="admin-input mt-1 disabled:opacity-50" /></label>
            <label className="admin-label">Réponse<select disabled={editing} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="admin-input mt-1 disabled:opacity-50"><option value="tous">Toutes les réponses</option><option value="accepte">Confirmés</option><option value="en_attente">En attente</option><option value="refuse">Refusés</option></select></label>
            <button disabled={editing} onClick={() => { setCode(''); setName(''); setStatus('tous'); setPage(1); }} className="admin-button self-end border border-[var(--primary)]/15 hover:bg-slate-50 disabled:opacity-40">Réinitialiser</button>
          </div>}
          {!editing && <p className="mt-3 text-xs text-slate-500">Repas et couchage indiquent l’invitation du groupe, quelle que soit la réponse individuelle. L’export contient tous les résultats filtrés, sur toutes les pages.</p>}
          {!editing && <label className="admin-label mt-4 block lg:hidden">Trier par<select value={`${sort}:${descending ? 'desc' : 'asc'}`} onChange={e => { const [field, direction] = e.target.value.split(':'); setSort(field as SortField); setDescending(direction === 'desc'); setPage(1); }} className="admin-input mt-1">
            {[...sortHeaders, { field: 'dateModification' as const, label: 'Date' }, ...events.map(e => ({ field: e.key, label: e.label })), ...invitationFlags.map(f => ({ field: f.key, label: f.label }))].flatMap(item => ['asc', 'desc'].map(direction => <option key={`${item.field}:${direction}`} value={`${item.field}:${direction}`}>{item.label} · {direction === 'asc' ? 'croissant' : 'décroissant'}</option>))}
          </select></label>}
        </div>

        {!loading && !filtered.length && <div className="p-10 text-center"><p className="font-semibold">Aucun invité à afficher</p><p className="mt-2 text-sm text-slate-500">{guests.length ? 'Essayez un autre filtre ou réinitialisez la recherche.' : 'Les invitations apparaîtront ici une fois chargées.'}</p></div>}
        {!!visible.length && <>
          <div className="admin-table-scroll hidden lg:block" tabIndex={0} role="region" aria-label="Tableau des invités, défilement horizontal si nécessaire">
            <table className={`admin-table ${editing ? 'admin-table-editing' : ''}`}><caption className="sr-only">Réponses individuelles, présences au week-end et invitation au repas et au couchage</caption><thead><tr>
              {sortHeaders.map(h => <th key={h.field} scope="col" aria-sort={ariaSort(h.field)}>{sortableHeader(h.field, h.label)}</th>)}
              <th scope="col">Email</th>
              {events.map(e => <th key={e.key} scope="col" aria-sort={ariaSort(e.key)}>{sortableHeader(e.key, e.short)}</th>)}
              {invitationFlags.map(f => <th key={f.key} scope="col" aria-sort={ariaSort(f.key)}>{sortableHeader(f.key, f.label)}</th>)}
              <th scope="col">Commentaires</th><th scope="col" aria-sort={ariaSort('dateModification')}>{sortableHeader('dateModification', 'Mise à jour')}</th>
            </tr></thead><tbody>{visible.map(g => {
              const edits = guestEdits(g);
              return <tr key={`${g.codeInvitation}-${g.nom}`}>
                <td className="font-mono text-xs text-slate-500">{g.codeInvitation}</td>
                <th scope="row" className="font-semibold">{g.nom}</th>
                <td>{editing
                  ? <select aria-label={`Réponse de ${g.nom}`} value={edits.statut} disabled={saving} onChange={e => updateStatus(g, e.target.value)} className="admin-input min-w-32 px-2 text-sm disabled:opacity-50">
                    <option value="accepte">Confirmé</option><option value="en_attente">En attente</option><option value="refuse">Refusé</option>
                  </select>
                  : <Status status={g.statut} />}</td>
                <td className="break-words text-slate-600">{editing
                  ? <input type="email" aria-label={`E-mail de ${g.nom}`} autoComplete="email" value={edits.email} disabled={saving} onChange={e => updateGuest(g, { email: e.target.value })} className="admin-input min-w-48 px-2 text-sm disabled:opacity-50" />
                  : g.email || '—'}</td>
                {events.map(e => <td key={e.key} className="text-center">{editing
                  ? <input type="checkbox" aria-label={`${e.short} : ${g.nom}`} checked={edits[e.key]} disabled={saving} onChange={event => updateGuest(g, { [e.key]: event.target.checked })} className="h-5 w-5 accent-[var(--secondary)]" />
                  : <span className={g[e.key] && g.statut === 'accepte' ? 'font-semibold text-[var(--secondary)]' : 'text-slate-400'}>{g[e.key] && g.statut === 'accepte' ? 'Oui' : '—'}</span>}</td>)}
                {invitationFlags.map(f => <td key={f.key}><InvitationFlag value={g[f.key]} /></td>)}
                <td className="text-slate-600">{editing
                  ? <textarea aria-label={`Commentaire de ${g.nom}`} value={edits.commentaires} disabled={saving} onChange={e => updateGuest(g, { commentaires: e.target.value })} rows={2} className="admin-input min-w-56 resize-y px-2 text-sm disabled:opacity-50" />
                  : <Comment text={g.commentaires} />}</td>
                <td className="text-xs text-slate-500">{g.dateModification?.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '—'}</td>
              </tr>;
            })}</tbody></table>
          </div>
          <div className="grid gap-2 bg-[var(--accent)] p-2 sm:grid-cols-2 sm:gap-3 sm:p-3 lg:hidden">{visible.map(g => {
            const edits = guestEdits(g);
            return <article key={`${g.codeInvitation}-${g.nom}`} className="admin-panel min-w-0 p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><p className="break-words text-sm font-semibold">{g.nom}</p><p className="mt-0.5 font-mono text-[.68rem] text-slate-500">{g.codeInvitation}</p></div>
                {editing
                  ? <select aria-label={`Réponse de ${g.nom}`} value={edits.statut} disabled={saving} onChange={e => updateStatus(g, e.target.value)} className="admin-input w-auto px-2 text-sm disabled:opacity-50">
                    <option value="accepte">Confirmé</option><option value="en_attente">En attente</option><option value="refuse">Refusé</option>
                  </select>
                  : <Status status={g.statut} />}
              </div>
              {editing
                ? <label className="admin-label mt-3 block">E-mail<input type="email" autoComplete="email" value={edits.email} disabled={saving} onChange={e => updateGuest(g, { email: e.target.value })} className="admin-input mt-1 text-sm disabled:opacity-50" /></label>
                : <p className="mt-2 truncate text-xs text-slate-600" title={g.email || undefined}>{g.email || 'E-mail non renseigné'}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.68rem]">
                {invitationFlags.map(f => <span key={f.key} className="inline-flex items-center gap-1"><span className="text-slate-500">{f.label}</span><InvitationFlag value={g[f.key]} /></span>)}
              </div>
              {editing
                ? <fieldset className="mt-3">
                  <legend className="admin-label mb-1">Présence aux événements</legend>
                  <div className="grid grid-cols-3 gap-1.5">
                    {events.map(e => <label key={e.key} className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[var(--primary)]/10 px-1 text-xs">
                      <input type="checkbox" aria-label={`${e.label} : ${g.nom}`} checked={edits[e.key]} disabled={saving} onChange={event => updateGuest(g, { [e.key]: event.target.checked })} className="h-4 w-4 shrink-0 accent-[var(--secondary)]" />
                      <span className="truncate">{e.short}</span>
                    </label>)}
                  </div>
                </fieldset>
                : <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Présence aux événements">
                  {events.map(e => <span key={e.key} className={`rounded-md px-1.5 py-1 text-[.68rem] ${g[e.key] && g.statut === 'accepte' ? 'bg-green-50 font-medium text-[var(--secondary)]' : 'bg-slate-50 text-slate-500'}`}>
                    {g[e.key] && g.statut === 'accepte' ? '✓ ' : ''}{e.short}
                  </span>)}
                </div>}
              {editing
                ? <label className="admin-label mt-3 block">Commentaire<textarea value={edits.commentaires} disabled={saving} onChange={e => updateGuest(g, { commentaires: e.target.value })} rows={2} className="admin-input mt-1 resize-y text-sm disabled:opacity-50" /></label>
                : !!g.commentaires && <div className="mt-2 border-t border-[var(--primary)]/10 pt-2 text-sm"><Comment text={g.commentaires} /></div>}
              {!editing && g.dateModification && <p className="mt-2 text-[.65rem] text-slate-400">{`Mis à jour le ${g.dateModification.toLocaleDateString('fr-FR')}`}</p>}
            </article>;
          })}</div>
        </>}

        {editing && <div className="sticky bottom-2 z-10 mx-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/10 bg-white p-3 shadow-lg sm:mx-5 sm:p-4">
          <div className="min-w-0">
            <p role="status" aria-live="polite" className="font-semibold">{changedGuests.length ? `${changedGuests.length} invité${changedGuests.length > 1 ? 's' : ''} modifié${changedGuests.length > 1 ? 's' : ''}` : 'Aucune modification'}</p>
            {saveError && <p role="alert" className="mt-1 text-sm text-red-700">{saveError}</p>}
          </div>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <button type="button" onClick={() => cancelEditing(true)} disabled={saving} className="admin-button border border-[var(--primary)]/15 disabled:opacity-50">Annuler</button>
            <button type="button" onClick={saveEdits} disabled={saving || !changedGuests.length} className="admin-button bg-[var(--primary)] text-white hover:bg-[var(--dark)] disabled:opacity-40"><Save size={16} aria-hidden="true" />{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </div>}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--primary)]/10 p-4 text-sm sm:px-5">
          <label className="flex items-center gap-2 text-slate-600">Par page<select disabled={editing} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="admin-input w-auto disabled:opacity-50"><option>20</option><option>50</option><option>100</option></select></label>
          <p className="text-slate-500">{filtered.length ? `${offset + 1}–${offset + visible.length} sur ${filtered.length}` : '0 résultat'}</p>
          <div className="flex items-center gap-3"><button aria-label="Page précédente" disabled={editing || currentPage === 1} onClick={() => setPage(currentPage - 1)} className="admin-button border border-[var(--primary)]/15 disabled:opacity-30"><ChevronLeft size={18} /></button><span className="tabular-nums">{currentPage} / {pages}</span><button aria-label="Page suivante" disabled={editing || currentPage === pages} onClick={() => setPage(currentPage + 1)} className="admin-button border border-[var(--primary)]/15 disabled:opacity-30"><ChevronRight size={18} /></button></div>
        </div>
      </section>
    </div>
  </main>;
}
