# Documentation du projet

État de référence : **3 octobre 2026**, confronté au code du dépôt. Les documents décrivent l’implémentation actuelle ; les plans et captures conservent aussi l’historique des ajustements.

| Document | Usage |
| --- | --- |
| [README du projet](../README.md) | Démarrage, fonctionnalités et commandes usuelles. |
| [AGENTS.md](../AGENTS.md) | Consignes de contribution et préférences des propriétaires. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, composants, données et rendu. |
| [CONFIGURATION.md](CONFIGURATION.md) | Environnement, Firebase, commandes, export et déploiement. |
| [DATA_MODEL.md](DATA_MODEL.md) | Collections, champs, catégories et écritures RSVP. |
| [DECISIONS.md](DECISIONS.md) | Choix en vigueur et historique des choix remplacés. |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Fonctionnalités livrées, validations et limites connues. |
| [Plans](plans/README.md) | Organisation des travaux et plans terminés. |
| [Captures](screenshots/README.md) | Index des screenshots et limites de leur actualité. |

## Où modifier quoi ?

| Contenu/comportement | Source |
| --- | --- |
| Date, logo, noms, countdown, couleurs et paramètres de l’aurore | `components/Hero.tsx`, `components/Signature.tsx`, `components/Aurora/Aurora.tsx` |
| Invitation sur la landing, programme, lieu, FAQ, contact, accès au voyage | `components/InfoSection.tsx` |
| Confirmation, texte d’invitation et choix d’accès au RSVP/hébergement | `app/confirmation/page.tsx`, Firestore, `config/codes.ts` |
| Réponse individuelle, événements, email et commentaires | `components/RSVPFormFirebase.tsx` |
| Hébergements, prix indicatifs, capacités et coordonnées | `components/Hebergement.tsx` |
| Escales du Japon, textes, visuels | `tripSteps` dans `app/noces/page.tsx` |
| Albums locaux / OneDrive | `app/gallerie/page.tsx`, `app/gallerie-cloud/page.tsx` |
| Statistiques, filtres et CSV admin | `app/admin/page.tsx` |
| Styles, responsive, police | `app/globals.css`, `tailwind.config.ts`, `public/fonts/` |
| Export et déploiement | `next.config.js`, `.github/workflows/deploy.yml` |

`DEVISIONS.md`, ancien fichier vide avec une faute de nom, est conservé comme renvoi vers `DECISIONS.md` pour éviter deux sources divergentes.
