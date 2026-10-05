export interface AdminGuest {
  codeInvitation: string;
  nom: string;
  email: string;
  statut: 'accepte' | 'refuse' | 'en_attente';
  participation_repas?: boolean;
  couchage_sur_place?: boolean;
  vendredi_soir: boolean;
  samedi_soir: boolean;
  dimanche_brunch: boolean;
  commentaires: string;
  dateModification?: Date;
}

/** Keep one physical line per guest; flatten field line breaks only in the export. */
export function serializeCsv(rows: readonly (readonly string[])[]): string {
  return '\uFEFF' + rows.map(row => row.map(value =>
    `"${value.replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`,
  ).join(',')).join('\r\n');
}

export function buildRsvpCsv(guests: readonly AdminGuest[]): string {
  const statuses = { accepte: 'Confirmé', refuse: 'Refusé', en_attente: 'En attente' };
  const invitationFlag = (value: boolean | undefined) =>
    value === true ? 'Oui' : value === false ? 'Non' : 'Non renseigné';
  const attendance = (guest: AdminGuest, value: boolean) =>
    guest.statut === 'accepte' && value ? 'Oui' : '—';

  return serializeCsv([
    ['Code', 'Invité', 'Réponse', 'Email', 'Vendredi', 'Samedi', 'Dimanche', 'Repas', 'Couchage sur place', 'Commentaires', 'Mise à jour'],
    ...guests.map(guest => [
      guest.codeInvitation, guest.nom, statuses[guest.statut], guest.email,
      attendance(guest, guest.vendredi_soir),
      attendance(guest, guest.samedi_soir),
      attendance(guest, guest.dimanche_brunch),
      invitationFlag(guest.participation_repas),
      invitationFlag(guest.couchage_sur_place),
      guest.commentaires,
      guest.dateModification?.toLocaleString('fr-FR') || '',
    ]),
  ]);
}
