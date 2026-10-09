# Configuration et exploitation

## Installation et commandes

Node.js 20 et npm : `npm ci --legacy-peer-deps`, puis crÃ©er `.env.local` et lancer `npm run dev`.

| Commande | Usage |
| --- | --- |
| `npm test` | Tous les tests locaux, avec donnÃ©es fictives et sans appel Ã  Firebase. |
| `npm run test:csv` | Tests CSV ciblÃ©s. |
| `npx tsc --noEmit` | Types et variables/paramÃ¨tres inutilisÃ©s. |
| `npm run build` | Compilation et export statique dans `out/`. |
| `npm run lint` | Next lint ; une configuration ESLint peut Ãªtre demandÃ©e au premier usage. |
| `node scripts/prepare-noces-models.mjs` | RÃ©gÃ©nÃ©rer les modÃ¨les web ; argument optionnel `tokyo`, `restaurant` ou `temple`. |

Next.js 14 exporte directement via `output: 'export'`. Ne pas lancer `next export`, ni prÃ©visualiser un export avec `next start`. Pour reproduire la production, servir `out/` sous `/wedding/`.

Ne pas construire et prÃ©visualiser simultanÃ©ment dans le mÃªme `.next`. Si nÃ©cessaire, utiliser une copie temporaire sous `build/`, avec app/components/config/lib/public, dÃ©pendances, package/configs, **postcss.config.mjs**, types Next et environnement local non publiÃ©. Les sources `assets/models/` sont nÃ©cessaires aux tests/prÃ©parations, pas au build du site.

## Variables

| Variable locale/build | Secret GitHub Actions |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `FIREBASE_API_KEY` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `FIREBASE_AUTH_DOMAIN` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `FIREBASE_PROJECT_ID` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `FIREBASE_STORAGE_BUCKET` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `FIREBASE_MESSAGING_SENDER_ID` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `FIREBASE_APP_ID` |
| `NEXT_PUBLIC_CODES_RSVP` | `NEXT_PUBLIC_CODES_RSVP` |

Les valeurs Firebase viennent de la configuration Web du projet. La liste RSVP est sÃ©parÃ©e par des virgules ; utiliser des codes en majuscules. `config/codes.ts` nettoie les espaces/entrÃ©es vides, sans changer la casse. Les catÃ©gories repas/couchage sont des flags Firestore, pas des listes d'environnement.

`NEXT_PUBLIC_BASE_PATH` est injectÃ© par `next.config.js` : vide en dÃ©veloppement et `/wedding` en production. Les variables `NEXT_PUBLIC_*` sont intÃ©grÃ©es au client : les secrets GitHub Ã©vitent leur prÃ©sence dans Git, mais ne les rendent pas secrÃ¨tes dans le site. Une modification nÃ©cessite une nouvelle construction/reprise du serveur.

## Firebase et maintenance des invitations

Activer Firestore et Authentication Email/Password ; crÃ©er les comptes autorisÃ©s et les invitations suivant [DATA_MODEL.md](DATA_MODEL.md). Le dÃ©pÃ´t ne versionne pas les rÃ¨gles Firebase, rÃ´les admin ni Ã©mulateur.

### Initialiser les champs repas et couchage

[La procÃ©dure complÃ¨te](../migration/README.md) dÃ©crit `migration/update-invitation-flags.mjs`, son JSON privÃ© et Google Cloud CLI/IAM. Depuis la racine :

```sh
node migration/update-invitation-flags.mjs --validate-only
# Lecture et aperÃ§u, avec Google Cloud CLI connectÃ©
node migration/update-invitation-flags.mjs
# Ã‰criture explicite uniquement lorsqu'une mise Ã  jour est voulue
node migration/update-invitation-flags.mjs --apply
```

Le script modifie uniquement les deux flags, avec prÃ©conditions de version et commit atomique jusqu'Ã  500 invitations ; `statuts` reste intact. Les groupes sans repas ont aussi le couchage Ã  `false` ; les autres invitations valides ont les flags Ã  `true`, sauf exclusions de couchage. VÃ©rifier que les rÃ¨gles couvrent toute la base avant d'appliquer. Les codes inconnus/doublons, membres invalides et modifications concurrentes bloquent l'Ã©criture. Ne pas publier l'aperÃ§u ou le JSON privÃ©.

## DÃ©ploiement

`.github/workflows/deploy.yml` construit sur push `main` ou dÃ©clenchement manuel, avec Node 20, npm et les secrets ci-dessus ; il publie `out/` via GitHub Pages. Configurer Pages pour GitHub Actions. Un changement du prÃ©fixe `/wedding` exige aussi une vÃ©rification des liens et assets.

Les fichiers sources dans `assets/`, tests, scripts et docs ne sont pas diffusÃ©s. Seules les variantes web des modÃ¨les restent dans `public/assets/models/`. [CrÃ©dits et prÃ©paration](NOCES_MODELS.md).
