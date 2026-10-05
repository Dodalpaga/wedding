import type { AdminGuest } from './rsvp-csv';

export function getInvitationAttendance(guests: readonly AdminGuest[]) {
  const count = (field: 'participation_repas' | 'couchage_sur_place') => {
    const invited = guests.filter(guest => guest[field] === true);
    return {
      invited: invited.length,
      confirmed: invited.filter(guest => guest.statut === 'accepte').length,
      unknown: guests.filter(guest => typeof guest[field] !== 'boolean').length,
    };
  };
  return { repas: count('participation_repas'), couchage: count('couchage_sur_place') };
}
