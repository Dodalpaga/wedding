# Documentation du projet

Documentation de l'implÃ©mentation actuelle. Les essais, captures et plans temporaires restent sous `build/`, ignorÃ© par Git.

| Document | Contenu |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | Routes, composants, interactions et contraintes de rendu. |
| [Configuration](CONFIGURATION.md) | Installation, variables, commandes, Firebase et dÃ©ploiement. |
| [DonnÃ©es](DATA_MODEL.md) | Invitations, RSVP, flags et CSV. |
| [ModÃ¨les Noces](NOCES_MODELS.md) | Sources, licences, prÃ©paration et contrÃ´les du voyage. |
| [Ã‰tat actuel](PROJECT_STATE.md) | VÃ©rifications et limites connues. |

## OÃ¹ modifier quoi ?

| Sujet | Source |
| --- | --- |
| Hero, date, logo, signature et aurore | `components/Hero.tsx`, `components/Signature.tsx`, `components/Aurora.tsx` |
| Informations, programme, lieu, FAQ et contact | `components/InfoSection.tsx` |
| Invitation et rÃ©ponse individuelle | `app/confirmation/page.tsx`, `components/RSVPFormFirebase.tsx`, `config/codes.ts` |
| HÃ©bergements | `components/Hebergement.tsx` |
| Voyage, camÃ©ras et inclinaison du tÃ©lÃ©phone | `app/noces/`, `components/noces/` |
| Administration, statistiques et CSV | `app/admin/page.tsx`, `components/AdminDashboardView.tsx`, `lib/admin-stats.ts`, `lib/rsvp-csv.ts` |
| Sources de modÃ¨les et signatures | `assets/models/`, `assets/signatures/` |
| Flags des invitations | [Outils de migration](../migration/README.md) |
| Export | `next.config.js`, `.github/workflows/deploy.yml` |
