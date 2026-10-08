# Configuration et exploitation

## Installation locale

La cartographie Motiontemplate est préparée avant le défilement. La progression reflète les vues prêtes, pas les octets téléchargés. La couverture avec marge puis aux dimensions visibles est téléchargée et décodée ; MapLibre retient les buffers, et les corps vectoriels reçus restent disponibles en Blob locaux pour les recréations de tuiles. Ces ressources sont libérées à la fin de la visite ; pas de stockage persistant supplémentaire. Les erreurs proposent Réessayer ou Passer le voyage. Tests de préparation : `node tests/globe-preload.test.cjs` (sept tests), `node tests/globe-resources.test.cjs` (trois tests de réutilisation des données, retry et libération), en complément des tests du trajet.

`/motiontemplate/` utilise MapLibre pour le globe, OGL pour les nuages et Three.js pour les trois GLB, les ombres et l'occlusion ambiante. Les sources et la préparation des modèles sont décrites dans [MOTIONTEMPLATE_MODELS.md](MOTIONTEMPLATE_MODELS.md). Régénération : `node scripts/prepare-motion-models.mjs` (option : `restaurant`, `tokyo` ou `temple`). Contrôles : `node tests/motion-journey.test.cjs`, `node tests/globe-preload.test.cjs`, `node tests/globe-resources.test.cjs`, `node tests/experience-state.test.cjs`, `node tests/motion-models.test.mjs`.

GSAP 3.14.2 et ScrollTrigger sont intégrés à la route Noces. `node scripts/prepare-noces-solar-mask.cjs` prépare hors ligne son atlas lumineux avec Sharp (option `--sharp-module` pour un runtime externe). Les WebP photographiques originaux ne sont pas modifiés. `scripts/check-noces-gsap.cjs` compare des exports locaux avec Playwright ; options `--before`, `--after`, `--report`, `--playwright-module`, `--chrome-path`, `--only-after`, `--only-network`, `--cpu-rate` (4 par défaut), `--viewport` (largeur filtrée), `--fast-steps` (60 par défaut), `--trace-width` (320 par défaut) et `--warm-both` (attente des blobs des deux versions).

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

Les six valeurs Firebase proviennent de la configuration de l’application Web dans Firebase. La liste RSVP est séparée par des virgules. `config/codes.ts` supprime les espaces autour de chaque code et les entrées vides, mais ne convertit pas la casse : utiliser des codes en majuscules pour correspondre à la confirmation.

Les anciennes variables `NEXT_PUBLIC_CODES_AVEC_HEBERGEMENT` et `NEXT_PUBLIC_CODES_VIN_HONNEUR` sont remplacées par les flags Firestore `couchage_sur_place` et `participation_repas`. Elles ne sont plus lues par le site et ne sont plus injectées par GitHub Actions. Leurs entrées ont été retirées du `.env.local` de ce poste ; les anciens secrets GitHub peuvent être supprimés depuis les paramètres du dépôt. Modifier les flags en base agit à la prochaine lecture de l’invitation, sans nouvelle construction.

`NEXT_PUBLIC_BASE_PATH` est injecté par `next.config.js` : vide en développement, `/wedding` en production. Ne pas le traiter comme une variable de secret à renseigner manuellement.

Les variables `NEXT_PUBLIC_*` sont intégrées au bundle client lors de la construction. Une modification dans GitHub ou `.env.local` nécessite une nouvelle construction/reprise du serveur. Le stockage dans GitHub Secrets évite leur présence en clair dans le dépôt ; il ne les rend pas secrètes une fois incluses dans le site.

## Firebase

Activer Firestore et Authentication Email/Password. Créer les comptes autorisés dans Firebase, sans identifiants ou mots de passe d’exemple partagés. Créer les invitations avec leurs deux flags suivant [DATA_MODEL.md](DATA_MODEL.md), puis renseigner la liste RSVP.

Le dépôt ne fournit ni règles Firestore, ni configuration CLI Firebase, ni émulateur, ni règles/claims de rôle admin. Il ne permet donc pas de confirmer la politique réelle d’accès en production. L’admin filtre sa présentation sur une session Firebase ; RSVP, compteur et galeries ne doivent pas être pris pour des mécanismes de confidentialité serveur.

## Initialiser les champs repas et couchage

`migration/update-invitation-flags.mjs` fonctionne avec Node.js 20, sans dépendance supplémentaire. Il utilise l’API REST Firestore et une connexion Google Cloud autorisée au projet (IAM), distincte de la connexion Firebase Authentication du site. Installer [Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk), puis exécuter `gcloud auth login`. Les paramètres publics Firebase ne fournissent pas de droits d’administration.

La migration a été appliquée avec succès par le propriétaire dans Cloud Shell le 5 octobre 2026. [Le dossier migration](../migration/README.md) regroupe les outils pour une éventuelle mise à jour ultérieure.

Le script lit uniquement `NEXT_PUBLIC_FIREBASE_PROJECT_ID` dans `.env.local` à la racine du projet, sans afficher sa valeur. La base ciblée est `(default)`. Les règles privées sont dans `migration/firebase-invitation-flags.local.json`, ignoré par Git. Exemple fictif de structure :

```json
{
  "sans_repas": ["ABCDEF"],
  "sans_couchage": ["ABCDEF", "GHIJKL"]
}
```

**Tous les autres codes de six caractères reçoivent `true` pour les deux champs.** Les groupes sans repas reçoivent aussi `couchage_sur_place: false`. Vérifier que ces règles correspondent à toute la base avant l’application.

Depuis la racine du projet :

```sh
# Vérifie les fichiers locaux sans connexion ni appel Firebase
node migration/update-invitation-flags.mjs --validate-only
# Lit les invitations et affiche les changements, sans écrire
node migration/update-invitation-flags.mjs
# Applique les changements après une nouvelle lecture
node migration/update-invitation-flags.mjs --apply
```

Les lectures sont paginées et limitées aux membres et aux deux nouveaux champs. L’aperçu affiche codes, effectifs et booléens, sans noms ni emails : ne pas publier cette sortie. Les codes d’exclusion inconnus, les doublons et les invitations mal formées bloquent l’écriture. Les documents hors codes de six caractères sont ignorés ; une invitation à code valide sans membres bloque le traitement.

Un seul commit atomique modifie uniquement les deux champs, avec un masque et une précondition sur l’horodatage de chaque invitation modifiée. Il ne crée pas d’invitations et conserve `statuts`, les messages et les autres champs. Les valeurs identiques sont ignorées. Au-delà de 500 modifications, le script s’arrête. Si une invitation change entre lecture et commit, le commit échoue : relire l’aperçu avant de réessayer. En cas de coupure pendant l’écriture, son résultat peut être indéterminé : relancer l’aperçu pour le vérifier.

Tests hors réseau : `node --test migration/invitation-flags.test.mjs`. Le client utilise désormais les flags Firestore pour le vin d’honneur et les suggestions de logement ; le workflow n’injecte plus les deux anciennes listes.

Le dashboard admin utilise désormais ces deux champs pour les colonnes et les ratios confirmés/invités. Tests de ces calculs : `node --test tests/admin-stats.test.cjs`.

Dans **Google Cloud Shell**, importer seulement le script et le JSON privé dans le même dossier, puis lancer depuis ce dossier :

```sh
# Vérifier que le projet actif correspond au projet Firebase voulu
gcloud config get-value project
node update-invitation-flags.mjs --cloud-shell
node update-invitation-flags.mjs --cloud-shell --apply
```

`--cloud-shell` lit le projet gcloud actif et le JSON dans le dossier courant. Aucun `.env.local` n’est nécessaire et aucune valeur du projet n’est imprimée par le script. Le shell demande éventuellement une autorisation Google lors du premier accès. Le projet Firebase doit être sélectionné avant de lancer le script ; ne pas appliquer sur un autre projet.

## Commandes existantes

| Commande | Comportement actuel |
| --- | --- |
| `npm run dev` | Serveur de développement Next.js. |
| `npx tsc --noEmit` | Vérification TypeScript. |
| `npm run test:csv` | Tests CSV : onze colonnes du tableau, repas/couchage, présences confirmées, champs complexes et ordre des résultats. |
| `npm run build` | Compilation, validation et export statique dans `out/`. |
| `npm run lint` | `next lint` ; aucune configuration ESLint dédiée dans le dépôt, une initialisation interactive peut être demandée. |
| `npm run start` | `next start` ; non adapté à l’export statique actuel. |
| `npm run export` | `next build && next export` ; la seconde commande est obsolète avec Next.js 14. Utiliser `build`. |

Ne pas partager le même `.next` entre build et serveur actif. Des vérifications précédentes ont nécessité une copie propre lorsque `.next/trace` était verrouillé. Une copie de validation doit inclure app/components/config/lib/public, package.json, next.config.js, tsconfig.json, tailwind.config.ts, **postcss.config.mjs**, les types Next et l’environnement local, sans publier celui-ci. Nettoyer uniquement les fichiers temporaires créés pour cette vérification.

## Export et déploiement

Le workflow `.github/workflows/deploy.yml` se lance sur `main` ou manuellement. Il utilise Node 20, `npm ci --legacy-peer-deps` lorsque npm est détecté, construit avec Next, téléverse `out/` et déploie avec les actions GitHub Pages. Le workflow supporte aussi la détection d’un lockfile Yarn ; le dépôt actuel utilise npm.

Configurer GitHub Pages pour GitHub Actions et renseigner les sept secrets ci-dessus. Aucune publication n’a été déclenchée dans le cadre des modifications de documentation. Le nom de dépôt `/wedding` est codé dans la configuration de production : tout changement de sous-chemin exige une mise à jour de cette configuration et un audit des chemins d’assets.

Pour prévisualiser l’export, servir les fichiers statiques de façon que `out/` corresponde au chemin `/wedding/` du serveur. Un serveur Next `start` ou un hébergement de `out/` à la racine sans prise en compte de ce préfixe ne reproduit pas la production. Aucun workflow Vercel n’est configuré.

## Assets du voyage : originaux et copies de diffusion

La séquence active utilise les 597 WebP de `public/assets/torii-better-fps-frames/`, issus de `Torii_better_fps.mp4`, en 1280×720 natif, qualité 85, total 72,55 Mio. Elle conserve chaque frame sans crop ni resize ; un seul jeu sert mobile/tablette/PC. Aucun serveur d’optimisation d’images n’est nécessaire. Les 100 PNG et leurs anciennes variantes WebP sous `public/assets/frames/` restent historiques, intacts et inutilisés par le renderer actuel.

Le téléchargement et le décodage sont indépendants : quatre transferts préchargent les images sélectionnées selon la longueur du parcours, avec priorité à la position actuelle. Les blobs restent disponibles ; quatre décodages préparent une fenêtre de 16/24 bitmaps (téléphone/PC), sans nouvelle compression. Vérification ciblée : `node --test tests/noces-gsap.test.cjs tests/frame-blob-cache.test.cjs tests/frame-buffer.test.cjs` (22 tests). Voir [ARCHITECTURE.md](ARCHITECTURE.md) et les [mesures](screenshots/noces-gsap-adaptive/README.md) pour les limites.

Le motif, le nombre, le padding et les limites du renderer sont regroupés dans `FRAME_SEQUENCE` de `components/noces/frame-sequence.ts`. Les URLs des frames et des photos d’escales conservent `NEXT_PUBLIC_BASE_PATH`. Pour une photo d’escale, renseigner `image: '/images/nom-du-fichier.jpg'` dans `tripSteps`, puis placer le fichier sous `public/images/`.

Pour régénérer les anciennes copies PNG → WebP, `scripts/prepare-noces-frames.cjs` utilise Sharp ; ce script est historique et ne prépare pas la séquence active. Le build normal ne requiert ni Sharp ni FFmpeg : les assets sont déjà générés.

L’archive source est conservée localement dans `build/source-assets/frames.zip` (ignoré par Git), hors de `public/`. Les 100 PNG extraits ont été comparés par SHA-256 à l’archive et n’ont subi aucune modification.

Pour extraire chaque frame d’un nouveau MP4, utiliser `scripts/extract-video-frames.ps1` : [guide vidéo/Windows](VIDEO_FRAMES.md). Une extraction crée une séquence séparée ; modifier ensuite `FRAME_SEQUENCE` pour l’activer. Les cinq photos d’escales sont dans `public/images/noces/` ; leurs sources sont consignées dans ce guide.
