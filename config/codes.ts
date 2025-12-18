// config/codes.ts
// Configuration centralisée des codes d'invitation

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

/**
 * Récupère tous les codes avec suggestions d'hébergement
 */
export const getCodesAvecHebergement = (): string[] => {
  return parseCodeList(process.env.NEXT_PUBLIC_CODES_AVEC_HEBERGEMENT);
};

/**
 * Récupère les codes invités uniquement au vin d'honneur
 */
export const getCodesVinHonneur = (): string[] => {
  return parseCodeList(process.env.NEXT_PUBLIC_CODES_VIN_HONNEUR);
};
