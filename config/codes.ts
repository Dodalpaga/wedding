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

/**
 * Type d'hébergement suggéré
 */
export type TypeHebergement = 'voydie' | 'lamaud' | 'airbnb' | 'couples';

/**
 * Récupère les codes par groupe d'hébergement
 */
export const getCodesParGroupe = (groupe: TypeHebergement): string[] => {
  switch (groupe) {
    case 'voydie':
      // Famille Voydie (18 personnes) - Grand gîte de Ségur
      // Gilles Laurence Thomas Amandine +1, Didier, Danielle et JF, Claire Maelle Simon, Les Momisson
      return parseCodeList(process.env.NEXT_PUBLIC_CODES_HEBERGEMENT_VOYDIE);

    case 'lamaud':
      // Cousins Lamaud (8 personnes) - Petit gîte de l'Héritier
      return parseCodeList(process.env.NEXT_PUBLIC_CODES_HEBERGEMENT_LAMAUD);

    case 'airbnb':
      // Groupes de 4 à 6 personnes - AirBnB ou petit gîte
      // Maxime Jeanne Andreanne Théo (4 pers), Copains Théâtre (6 pers)
      return parseCodeList(process.env.NEXT_PUBLIC_CODES_AIRBNB);

    case 'couples':
      // Couples - Hôtel
      // JF Barraud & Annette, Isabelle & Thierry Jolivets, Pierrette & Alain LEDUC,
      // Gilles & Amandine (parrain Dorian), Vincent & Justine, Zina, Frédérique tante Solenne
      return parseCodeList(process.env.NEXT_PUBLIC_CODES_COUPLES);

    default:
      return [];
  }
};

/**
 * Vérifie si un code appartient à un groupe d'hébergement
 */
export const estDansGroupe = (
  code: string,
  groupe: TypeHebergement
): boolean => {
  return getCodesParGroupe(groupe).includes(code);
};
