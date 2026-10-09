# Mariage de Solenne et Dorian

Site en franÃ§ais, conÃ§u pour tÃ©lÃ©phone, avec Next.js 14 App Router et export statique sur GitHub Pages. Firestore et Firebase Authentication sont utilisÃ©s depuis le navigateur.

## DÃ©marrage

Node.js 20 et npm :

```sh
npm ci --legacy-peer-deps
# CrÃ©er .env.local suivant docs/CONFIGURATION.md
npm run dev
```

```sh
npm test
npx tsc --noEmit
npm run build
```

`build` produit directement `out/`. En production, le site utilise le prÃ©fixe `/wedding` ; en dÃ©veloppement, aucun prÃ©fixe. Le push sur `main` dÃ©clenche le dÃ©ploiement GitHub Pages.

## Routes

| Route | Fonction |
| --- | --- |
| `/` | Invitation, hero/aurore, programme provisoire, lieu, FAQ, contact e-mail et accÃ¨s RSVP. |
| `/confirmation/?code=CODE` | Message d'invitation et RSVP individuel modifiable. |
| `/hebergement/` | Suggestions locales avec filtres et coordonnÃ©es publiques. |
| `/noces/` | Globe Toulouseâ€“Tokyo, nuages, train Littlest Tokyo, visite Inakaya et carte Kinkakuji interactive au survol, au clavier ou par inclinaison du tÃ©lÃ©phone. |
| `/admin/` | Connexion Firebase, statistiques, filtres et CSV. |
| `/gallerie/`, `/gallerie-cloud/` | Prototypes de galeries locales/OneDrive ; la landing les annonce comme indisponibles. |

## Organisation

`app/` contient les routes et styles ; `components/` les interfaces, avec le voyage dans `components/noces/` ; `lib/` les calculs et Firebase ; `config/` la liste RSVP ; `public/` les assets servis ; `assets/` les sources de modÃ¨les et signatures conservÃ©es hors export ; `scripts/` les outils de prÃ©paration/tests ; `tests/` les tests ; `migration/` la maintenance des invitations ; `docs/` la documentation actuelle.

[Documentation](docs/README.md) Â· [Consignes](AGENTS.md) Â· [ModÃ¨les et crÃ©dits](docs/NOCES_MODELS.md)

Ne pas versionner `.env.local`, codes rÃ©els, donnÃ©es d'invitÃ©s ou exports administratifs. Les conditions d'affichage cÃ´tÃ© client ne remplacent pas les rÃ¨gles Firebase, qui ne sont pas dans ce dÃ©pÃ´t.
