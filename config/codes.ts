// config/codes.ts
// Liste publique des codes affichant le formulaire RSVP.

/**
 * Helper pour parser les listes de codes depuis les variables d'environnement
 */
const parseCodeList = (envVar: string | undefined): string[] => {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map((code) => code.trim())
    .filter((code) => code !== '');
};

/**
 * Récupère tous les codes autorisés pour le RSVP
 */
export const getCodesRSVP = (): string[] => {
  return parseCodeList(process.env.NEXT_PUBLIC_CODES_RSVP);
};
