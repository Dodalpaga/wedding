# Configuration et exploitation

## Installation locale

Node.js 20 est utilisé par GitHub Actions. Le lockfile npm est présent.

```sh
npm ci --legacy-peer-deps
npm run dev
```

Créer `.env.local` avant de lancer le site. Aucun template d’environnement n’est fourni dans le dépôt. Le fichier est ignoré par Git. Ne pas copier de valeurs réelles dans les documents, tickets ou captures.

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
| `NEXT_PUBLIC_CODES_AVEC_HEBERGEMENT` | `NEXT_PUBLIC_CODES_AVEC_HEBERGEMENT` |
| `NEXT_PUBLIC_CODES_VIN_HONNEUR` | `NEXT_PUBLIC_CODES_VIN_HONNEUR` |

Les six valeurs Firebase proviennent de la configuration de l’application Web dans Firebase. Les listes de codes sont séparées par des virgules. `config/codes.ts` supprime les espaces autour de chaque code et les entrées vides, mais ne convertit pas la casse : utiliser des codes en majuscules pour correspondre à la confirmation.

`NEXT_PUBLIC_BASE_PATH` est injecté par `next.config.js` : vide en développement, `/wedding` en production. Ne pas le traiter comme une variable de secret à renseigner manuellement.

Les variables `NEXT_PUBLIC_*` sont intégrées au bundle client lors de la construction. Une modification dans GitHub ou `.env.local` nécessite une nouvelle construction/reprise du serveur. Le stockage dans GitHub Secrets évite leur présence en clair dans le dépôt ; il ne les rend pas secrètes une fois incluses dans le site.

## Firebase

Activer Firestore et Authentication Email/Password. Créer les comptes autorisés dans Firebase, sans identifiants ou mots de passe d’exemple partagés. Créer les invitations suivant [DATA_MODEL.md](DATA_MODEL.md), puis renseigner les listes de catégories.

Le dépôt ne fournit ni règles Firestore, ni configuration CLI Firebase, ni émulateur, ni règles/claims de rôle admin. Il ne permet donc pas de confirmer la politique réelle d’accès en production. L’admin filtre sa présentation sur une session Firebase ; RSVP, compteur et galeries ne doivent pas être pris pour des mécanismes de confidentialité serveur.

## Commandes existantes

| Commande | Comportement actuel |
| --- | --- |
| `npm run dev` | Serveur de développement Next.js. |
| `npx tsc --noEmit` | Vérification TypeScript. |
| `npm run test:csv` | Tests de non-régression du CSV : champs complexes et colonnes. |
| `npm run build` | Compilation, validation et export statique dans `out/`. |
| `npm run lint` | `next lint` ; aucune configuration ESLint dédiée dans le dépôt, une initialisation interactive peut être demandée. |
| `npm run start` | `next start` ; non adapté à l’export statique actuel. |
| `npm run export` | `next build && next export` ; la seconde commande est obsolète avec Next.js 14. Utiliser `build`. |

Ne pas partager le même `.next` entre build et serveur actif. Des vérifications précédentes ont nécessité une copie propre lorsque `.next/trace` était verrouillé. Une copie de validation doit inclure app/components/config/lib/public, package.json, next.config.js, tsconfig.json, tailwind.config.ts, **postcss.config.mjs**, les types Next et l’environnement local, sans publier celui-ci. Nettoyer uniquement les fichiers temporaires créés pour cette vérification.

## Export et déploiement

Le workflow `.github/workflows/deploy.yml` se lance sur `main` ou manuellement. Il utilise Node 20, `npm ci --legacy-peer-deps` lorsque npm est détecté, construit avec Next, téléverse `out/` et déploie avec les actions GitHub Pages. Le workflow supporte aussi la détection d’un lockfile Yarn ; le dépôt actuel utilise npm.

Configurer GitHub Pages pour GitHub Actions et renseigner les neuf secrets ci-dessus. Aucune publication n’a été déclenchée dans le cadre des modifications de documentation. Le nom de dépôt `/wedding` est codé dans la configuration de production : tout changement de sous-chemin exige une mise à jour de cette configuration et un audit des chemins d’assets.

Pour prévisualiser l’export, servir les fichiers statiques de façon que `out/` corresponde au chemin `/wedding/` du serveur. Un serveur Next `start` ou un hébergement de `out/` à la racine sans prise en compte de ce préfixe ne reproduit pas la production. Aucun workflow Vercel n’est configuré.

## Assets du voyage : originaux et copies de diffusion

La séquence active utilise les 597 WebP de `public/assets/torii-better-fps-frames/`, issus de `Torii_better_fps.mp4`, en 1280×720 natif, qualité 85, total 72,55 Mio. Elle conserve chaque frame sans crop ni resize ; un seul jeu sert mobile/tablette/PC. Aucun serveur d’optimisation d’images n’est nécessaire. Les 100 PNG et leurs anciennes variantes WebP sous `public/assets/frames/` restent historiques, intacts et inutilisés par le renderer actuel.

Le motif, le nombre, le padding et les limites du renderer sont regroupés dans `FRAME_SEQUENCE` de `components/noces/frame-sequence.ts`. Les URLs des frames et des photos d’escales conservent `NEXT_PUBLIC_BASE_PATH`. Pour une photo d’escale, renseigner `image: '/images/nom-du-fichier.jpg'` dans `tripSteps`, puis placer le fichier sous `public/images/`.

Pour régénérer les anciennes copies PNG → WebP, `scripts/prepare-noces-frames.cjs` utilise Sharp ; ce script est historique et ne prépare pas la séquence active. Le build normal ne requiert ni Sharp ni FFmpeg : les assets sont déjà générés.

L’archive source est conservée localement dans `build/source-assets/frames.zip` (ignoré par Git), hors de `public/`. Les 100 PNG extraits ont été comparés par SHA-256 à l’archive et n’ont subi aucune modification.

Pour extraire chaque frame d’un nouveau MP4, utiliser `scripts/extract-video-frames.ps1` : [guide vidéo/Windows](VIDEO_FRAMES.md). Une extraction crée une séquence séparée ; modifier ensuite `FRAME_SEQUENCE` pour l’activer. Les cinq photos d’escales sont dans `public/images/noces/` ; leurs sources sont consignées dans ce guide.
