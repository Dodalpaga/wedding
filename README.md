# Mariage de Solenne & Dorian

Site en français pour le mariage du **17 juillet 2027**, au Domaine d’en Naudet à Teyssode. Il présente les informations pratiques, les invitations et réponses individuelles, les hébergements et le voyage de noces au Japon.

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
| `/noces/` | Présentation du roadtrip d’un mois au Japon : escales provisoires, descriptions, visuels temporaires et avion animé. |
| `/admin/` | Connexion Firebase, suivi des réponses, statistiques, recherche, tri et export CSV. |
| `/gallerie/?code=CODE` | Prototype d’albums locaux avec visionneuse, zoom, miniatures et téléchargement. |
| `/gallerie-cloud/?code=CODE` | Prototype d’albums OneDrive ; la plupart des liens restent à compléter. |

Les routes des galeries conservent l’orthographe `gallerie` présente dans le code. La landing annonce la galerie comme « bientôt disponible ». Les codes d’invitation sont réutilisables pour modifier les réponses ; ils ne sont pas à usage unique.

## Stack et structure

Next.js 14.2.5 (App Router), React 18, TypeScript, Tailwind CSS 3, Firebase Firestore/Authentication. Framer Motion anime le voyage, OGL rend l’aurore, et les icônes proviennent de Lucide et Material UI.

```text
app/                    Routes, layout, styles globaux
components/             Hero, informations, RSVP, hébergements, animations
config/codes.ts         Catégories d’invitation depuis l’environnement
lib/firebase.ts         Initialisation du SDK client Firebase
public/                 Images, SVG, police Wedding et autres assets
.github/workflows/      Déploiement GitHub Pages
docs/                   Architecture, configuration, données, état, décisions, plans
```

## Configuration et données

Créer `.env.local` avec les six variables Firebase et les trois listes de codes décrites dans [CONFIGURATION.md](docs/CONFIGURATION.md). Ne pas versionner ce fichier ni publier de vrais codes ou de données personnelles dans la documentation.

Les collections utilisées sont **`codes_invitation`** et **`statuts`**. Le document d’invitation a pour identifiant son code ; ses `membres` sont les noms des personnes à inviter. Chaque réponse est écrite dans `statuts/{nom_membre}`. Voir [DATA_MODEL.md](docs/DATA_MODEL.md) pour les champs et contraintes.

L’admin utilise Firebase Authentication Email/Password. Le dépôt ne contient ni règles Firestore ni définition de rôles admin. Les variables `NEXT_PUBLIC_*` et les contrôles d’interface sont publics côté navigateur : ils ne remplacent pas les règles d’accès Firebase. Les galeries vérifient uniquement la présence d’un paramètre `code`, sans validation Firestore.

## Vérifier et construire

```sh
npx tsc --noEmit
npm run build
```

`npm run build` génère directement l’export statique dans `out/`. Le script `npm run export` contient encore `next export`, obsolète avec Next.js 14 : utiliser `build`. `npm run start` appelle `next start` et ne sert pas cet export ; prévisualiser `out/` avec un serveur statique en respectant le préfixe `/wedding`.

Une suite ciblée est disponible via `npm run test:csv` : retours à la ligne, guillemets, accents et alignement des colonnes. Aucune configuration ESLint dédiée n’est présente. `npm run lint` peut demander une configuration interactive. Les vérifications visuelles et fonctionnelles sont documentées dans [PROJECT_STATE.md](docs/PROJECT_STATE.md).

## Déploiement

Le workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) déploie sur GitHub Pages après un push sur `main` ou un déclenchement manuel. Il installe les dépendances, construit le site et publie `out/`. Les noms exacts des secrets sont dans [CONFIGURATION.md](docs/CONFIGURATION.md).

En production, `basePath`, `assetPrefix` et `NEXT_PUBLIC_BASE_PATH` valent `/wedding`. Les URLs finissent par `/`. Le déploiement Vercel évoqué dans l’ancien README n’est pas configuré dans le dépôt.

## Modifier le contenu

- Date, logo, signature et aurore : `components/Hero.tsx`.
- Lieu, programme, échéance RSVP, FAQ, contacts et lien du voyage : `components/InfoSection.tsx`.
- Étapes japonaises, textes et futures photos : `tripSteps` dans `app/noces/page.tsx`.
- Hébergements : tableau dans `components/Hebergement.tsx`.
- Invitations : Firestore et listes de catégories d’environnement ; une modification de ces listes exige une reconstruction du site.

Préserver les proportions du logo, de la signature et de `domaine.svg`, ainsi que les paramètres d’aurore demandés par les propriétaires. Ne pas afficher leurs numéros personnels. Voir [AGENTS.md](AGENTS.md) pour les consignes de contribution et [l’index documentaire](docs/README.md) pour les détails.

Projet personnel de Solenne & Dorian. Aucune licence de réutilisation n’est fournie dans le dépôt.
