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

/** Quote every field so commas, quotes and embedded newlines stay in one cell. */
export function serializeCsv(rows: readonly (readonly string[])[]): string {
  return '\uFEFF' + rows.map(row => row.map(value =>
    `"${value.replace(/"/g, '""')}"`,
  ).join(',')).join('\r\n');
}

export function buildRsvpCsv(guests: readonly AdminGuest[]): string {
  return serializeCsv([
    ['Code', 'Nom', 'Statut', 'Email', 'Vendredi soir', 'Samedi soir', 'Dimanche brunch', 'Commentaires', 'Date modification'],
    ...guests.map(guest => [
      guest.codeInvitation, guest.nom, guest.statut, guest.email,
      guest.vendredi_soir ? 'Oui' : 'Non',
      guest.samedi_soir ? 'Oui' : 'Non',
      guest.dimanche_brunch ? 'Oui' : 'Non',
      guest.commentaires,
      guest.dateModification?.toLocaleString('fr-FR') || '',
    ]),
  ]);
}
