# Documentation du projet

État de référence : **8 octobre 2026**, confronté au code du dépôt. Les documents décrivent l’implémentation actuelle ; les plans et captures conservent aussi l’historique des ajustements.

Travail actif : [GSAP, images originales et cache borné sur Noces](plans/active/noces-gsap-native-quality.md). Le stash des essais précédents a été supprimé à la demande de l’utilisateur. [Pauses résiduelles : mesures](screenshots/noces-last-stutters/README.md).

| Document | Usage |
| --- | --- |
| [README du projet](../README.md) | Démarrage, fonctionnalités et commandes usuelles. |
| [AGENTS.md](../AGENTS.md) | Consignes de contribution et préférences des propriétaires. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, composants, données et rendu. |
| [CONFIGURATION.md](CONFIGURATION.md) | Environnement, Firebase, commandes, export et déploiement. |
| [VIDEO_FRAMES.md](VIDEO_FRAMES.md) | Extraction complète MP4 → WebP avec FFmpeg sous Windows. |
| [DATA_MODEL.md](DATA_MODEL.md) | Collections, champs, catégories et écritures RSVP. |
| [DECISIONS.md](DECISIONS.md) | Choix en vigueur et historique des choix remplacés. |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Fonctionnalités livrées, validations et limites connues. |
| [Plans](plans/README.md) | Organisation des travaux et plans terminés. |
| [Captures](screenshots/README.md) | Index des screenshots et limites de leur actualité. |

[Modèles Motiontemplate et crédits](MOTIONTEMPLATE_MODELS.md).

## Où modifier quoi ?

| Contenu/comportement | Source |
| --- | --- |
| Date, logo, noms, countdown, couleurs et paramètres de l’aurore | `components/Hero.tsx`, `components/Signature.tsx`, `components/Aurora/Aurora.tsx` |
| Invitation sur la landing, programme, lieu, FAQ, contact, accès au voyage | `components/InfoSection.tsx` |
| Confirmation, texte d’invitation et choix d’accès au RSVP/hébergement | `app/confirmation/page.tsx`, Firestore, `config/codes.ts` |
| Réponse individuelle, événements, email et commentaires | `components/RSVPFormFirebase.tsx` |
| Hébergements, prix indicatifs, capacités et coordonnées | `components/Hebergement.tsx` |
| Escales du Japon, textes, visuels | `tripSteps` dans `app/noces/page.tsx` |
| Hero séquencé, scènes fixes en fondu et cartes photo | `components/noces/frame-sequence.ts`, `components/noces/useJourneyScenes.ts`, `components/noces/`, `app/noces/noces.css`, `scripts/extract-video-frames.ps1` |
| Ombre diagonale et rayons solaires au scroll | `components/noces/solar-rays.ts`, `components/noces/SequenceBackdrop.tsx`, `app/noces/noces.css` |
| Globe et nouvelles expériences japonaises | `app/motiontemplate/`, `components/motiontemplate/` ; [modèles](MOTIONTEMPLATE_MODELS.md), [plan actif](plans/active/motiontemplate-three-experiences.md) |
| Buffer réseau et caches des frames | `components/noces/frame-buffer.ts`, `components/noces/frame-blob-cache.ts`, `components/noces/frame-sequence.ts`, `tests/frame-buffer.test.cjs`, `tests/frame-blob-cache.test.cjs` |
| Volets des descriptions sur téléphone/écran court | `components/noces/StepDrawer.tsx`, `app/noces/noces.css` |
| Albums locaux / OneDrive | `app/gallerie/page.tsx`, `app/gallerie-cloud/page.tsx` |
| Statistiques, filtres et CSV admin | `app/admin/page.tsx` |
| Initialisation Firestore des champs repas/couchage par groupe | `migration/update-invitation-flags.mjs`, [procédure](CONFIGURATION.md#initialiser-les-champs-repas-et-couchage) |
| Présentation responsive admin et CSV à onze colonnes (repas/couchage inclus) | `components/AdminDashboardView.tsx`, `lib/rsvp-csv.ts`, `tests/rsvp-csv.test.cjs` |
| Ratios admin confirmés/invités au repas et au couchage | `lib/admin-stats.ts`, `tests/admin-stats.test.cjs` |
| Styles, responsive, police | `app/globals.css`, `tailwind.config.ts`, `public/fonts/` |
| Export et déploiement | `next.config.js`, `.github/workflows/deploy.yml` |

`DEVISIONS.md`, ancien fichier vide avec une faute de nom, est conservé comme renvoi vers `DECISIONS.md` pour éviter deux sources divergentes.
