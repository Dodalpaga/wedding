# Mariage de Solenne & Dorian

Site en français pour le mariage du **17 juillet 2027**, au Domaine d’en Naudet à Teyssode. Il présente les informations pratiques, les invitations et réponses individuelles, les hébergements et le voyage de noces au Japon.

Noces utilise désormais GSAP/ScrollTrigger avec les images originales 1280×720, un préchargement progressif et un cache de bitmaps borné. [Implémentation et validation en cours](docs/plans/active/noces-gsap-native-quality.md). [Amélioration des pauses](docs/screenshots/noces-last-stutters/README.md) et [dernières mesures du décodage](docs/screenshots/noces-decoder-priority/README.md).

Le fond Noces couvre la plus grande hauteur du navigateur mobile (`100lvh`), même pendant le repli de sa barre ; les commandes suivent la hauteur visible (`100dvh`) et le parcours de scroll reste dimensionné en `svh`.

## Démarrer

Utiliser Node.js 20 (version du workflow de déploiement) et npm.

```sh
npm ci --legacy-peer-deps
# Créer .env.local suivant docs/CONFIGURATION.md
npm run dev
```

Le site de développement est disponible sur http://localhost:3000, sans préfixe de chemin. Il n’existe actuellement aucun fichier `.env.local.example` dans le dépôt ; la liste complète des variables est dans [la configuration](docs/CONFIGURATION.md).

## Fonctionnalités et routes

| Route | État et rôle |
| --- | --- |
| `/` | Hero plein écran, aurore animée, date/lieu, accès RSVP, informations repliables, contact e-mail et lien vers le voyage. |
| `/confirmation/?code=CODE` | Lecture de l’invitation Firestore, sélection d’un invité et réponse individuelle, selon les catégories configurées. |
| `/hebergement/` | Neuf suggestions avec filtres par prix/capacité et coordonnées des établissements. Route directement accessible. |
| `/noces/` | Globe France–Japon, avion et sortie sous les nuages. Littlest Tokyo avec train au scroll, visite Inakaya par la porte et carte Kinkakuji avec rotation 3D au survol, au clavier ou en inclinant le téléphone. Position initiale neutre, activation des capteurs si nécessaire et recentrage. Occlusion ambiante/ombres et préparation complète avant le scroll. [Modèles et rendu](docs/MOTIONTEMPLATE_MODELS.md). |
| `/admin/` | Connexion Firebase, suivi des réponses, flags repas/couchage, ratios confirmés/invités pour les deux, recherche, tri et export CSV. |
| `/gallerie/?code=CODE` | Prototype d’albums locaux avec visionneuse, zoom, miniatures et téléchargement. |
| `/gallerie-cloud/?code=CODE` | Prototype d’albums OneDrive ; la plupart des liens restent à compléter. |

Les routes des galeries conservent l’orthographe `gallerie` présente dans le code. La landing annonce la galerie comme « bientôt disponible ». Les codes d’invitation sont réutilisables pour modifier les réponses ; ils ne sont pas à usage unique.

## Stack et structure

Next.js 14.2.5 (App Router), React 18, TypeScript, Tailwind CSS 3, Firebase Firestore/Authentication. Le voyage utilise des canvas et des fondus sans Framer Motion, avec caches mémoire bornés ; OGL rend l’aurore et le prototype WebGL autonome, et les icônes proviennent de Lucide et Material UI.

```text
app/                    Routes, layout, styles globaux
components/             Hero, informations, RSVP, hébergements, animations
config/codes.ts         Liste des codes affichant le formulaire RSVP
lib/firebase.ts         Initialisation du SDK client Firebase
public/                 Images, SVG, police Wedding et autres assets
.github/workflows/      Déploiement GitHub Pages
docs/                   Architecture, configuration, données, état, décisions, plans
```

## Configuration et données

Créer `.env.local` avec les six variables Firebase et la liste `NEXT_PUBLIC_CODES_RSVP` décrites dans [CONFIGURATION.md](docs/CONFIGURATION.md). Les flags Firestore déterminent le vin d’honneur uniquement et l’affichage des suggestions de logement. Ne pas versionner ce fichier ni publier de vrais codes ou de données personnelles dans la documentation.

Les collections utilisées sont **`codes_invitation`** et **`statuts`**. Le document d’invitation a pour identifiant son code ; ses `membres` sont les noms des personnes à inviter. Chaque réponse est écrite dans `statuts/{nom_membre}`. Voir [DATA_MODEL.md](docs/DATA_MODEL.md) pour les champs et contraintes.

Les booléens de groupe `participation_repas` et `couchage_sur_place` ont été initialisés dans Cloud Shell, avec succès confirmé par le propriétaire le 5 octobre 2026. Ils sont utilisés par le dashboard admin et la confirmation. Les outils sont regroupés dans [migration/](migration/README.md). Les règles réelles restent dans un fichier local ignoré par Git. Seule la liste RSVP reste dans l’environnement.

L’admin utilise Firebase Authentication Email/Password. Le dépôt ne contient ni règles Firestore ni définition de rôles admin. Les variables `NEXT_PUBLIC_*` et les contrôles d’interface sont publics côté navigateur : ils ne remplacent pas les règles d’accès Firebase. Les galeries vérifient uniquement la présence d’un paramètre `code`, sans validation Firestore.

## Vérifier et construire

```sh
npx tsc --noEmit
npm run build
```

`npm run build` génère directement l’export statique dans `out/`. Le script `npm run export` contient encore `next export`, obsolète avec Next.js 14 : utiliser `build`. `npm run start` appelle `next start` et ne sert pas cet export ; prévisualiser `out/` avec un serveur statique en respectant le préfixe `/wedding`.

Une suite ciblée est disponible via `npm run test:csv` : retours à la ligne, guillemets, accents et alignement des colonnes. Aucune configuration ESLint dédiée n’est présente. `npm run lint` peut demander une configuration interactive. Les vérifications visuelles et fonctionnelles sont documentées dans [PROJECT_STATE.md](docs/PROJECT_STATE.md).

L’export CSV suit les onze colonnes du tableau admin, avec les réponses en français, les présences des invités confirmés et les invitations au repas/couchage (Oui, Non ou Non renseigné). Il respecte les filtres et le tri sur toutes les pages. Les retours à la ligne des champs deviennent des espaces pour garder une ligne par invité ; les commentaires enregistrés et leur affichage restent inchangés.

## Déploiement

Le workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) déploie sur GitHub Pages après un push sur `main` ou un déclenchement manuel. Il installe les dépendances, construit le site et publie `out/`. Les noms exacts des secrets sont dans [CONFIGURATION.md](docs/CONFIGURATION.md).

En production, `basePath`, `assetPrefix` et `NEXT_PUBLIC_BASE_PATH` valent `/wedding`. Les URLs finissent par `/`. Le déploiement Vercel évoqué dans l’ancien README n’est pas configuré dans le dépôt.

## Modifier le contenu

- Date, logo, signature et aurore : `components/Hero.tsx`.
- Lieu, programme, échéance RSVP, FAQ, contacts et lien du voyage : `components/InfoSection.tsx`.
- Étapes japonaises, textes et futures photos : `tripSteps` dans `app/noces/page.tsx`.
- Séquence du hero : `FRAME_SEQUENCE` dans `components/noces/frame-sequence.ts` ; 597 WebP dans `public/assets/torii-better-fps-frames/`.
- Buffer réseau du hero : `components/noces/frame-buffer.ts` ; téléchargements anticipés indépendants des décodages, préchargement compressé sur PC et budgets mobiles adaptatifs, sans modifier le rendu.
- Photos des cartes : `public/images/noces/`, chemins dans `tripSteps.image` ; sources dans [le guide des frames et photos](docs/VIDEO_FRAMES.md).
- Carte d’ensemble du voyage : `public/images/noces/trip-overview.webp`, affichée dans `TripStages` ; présentation et filtres CSS dans `app/noces/noces.css`.
- Volets des descriptions sur petits écrans : `components/noces/StepDrawer.tsx` (fermés sous 768px ou sous 601px de hauteur).
- Ombre et textures du fond : `components/noces/background-treatment.ts` (choisir `1` ou `2`), masque/dégradé dans `app/noces/noces.css`.
- Présentation du voyage : `components/noces/` et `app/noces/noces.css`.
- Régénération des copies WebP : `scripts/prepare-noces-frames.cjs` (Sharp ; voir la configuration).
- Extraction de toutes les frames d’un MP4 : `scripts/extract-video-frames.ps1` (FFmpeg ; [guide Windows](docs/VIDEO_FRAMES.md)).
- Hébergements : tableau dans `components/Hebergement.tsx`.
- Invitations : message, membres et flags repas/couchage dans Firestore, pris en compte à la prochaine ouverture de l’invitation sans reconstruire le site. La liste RSVP reste dans l’environnement et exige une reconstruction si elle change.

Préserver les proportions du logo, de la signature et de `domaine.svg`, ainsi que les paramètres d’aurore demandés par les propriétaires. Ne pas afficher leurs numéros personnels. Voir [AGENTS.md](AGENTS.md) pour les consignes de contribution et [l’index documentaire](docs/README.md) pour les détails.

Projet personnel de Solenne & Dorian. Aucune licence de réutilisation n’est fournie dans le dépôt.
