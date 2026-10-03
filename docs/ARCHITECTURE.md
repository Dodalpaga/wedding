# Architecture

Référence : code du dépôt au 3 octobre 2026.

## Socle et rendu

Next.js 14.2.5 App Router, React 18, TypeScript en mode strict et Tailwind CSS 3. Le layout racine fixe `lang="fr"`, les métadonnées du mariage, charge les styles globaux et un preload de police. Les composants interactifs utilisent le rendu client React. Les appels Firestore et Authentication partent du navigateur via `lib/firebase.ts` ; il n’y a pas d’API serveur applicative dans le dépôt.

`next.config.js` configure `output: 'export'`, les images non optimisées et les slashs finaux. En production uniquement, `basePath`, `assetPrefix` et `NEXT_PUBLIC_BASE_PATH` sont `/wedding`. Les routes restent sans préfixe en développement. Le workflow GitHub Pages publie `out/`.

## Routes

| Route | Composition et fonctionnement |
| --- | --- |
| `/` | `Hero` + `InfoSection` + `Footer`, sous `.landing-page`. |
| `/confirmation/` | `useSearchParams` sous Suspense, lecture Firestore du code normalisé en majuscules, message d’invitation, catégories, lien d’hébergement et `RSVPFormFirebase`. |
| `/hebergement/` | Suspense, bouton `router.back()` et liste locale de neuf hébergements. |
| `/noces/` | Données `tripSteps`, présentation, timeline responsive, avion au scroll, visuels SVG temporaires, participation par urne. |
| `/admin/` | Authentification Email/Password, lecture des invitations et écoute des statuts, statistiques/tableau/export. |
| `/gallerie/` | Albums de démonstration locaux et lightbox avec Zoom, Download, Thumbnails. |
| `/gallerie-cloud/` | Albums OneDrive, ouverture des liens renseignés dans un nouvel onglet. |

## Landing

Le hero occupe au minimum `100svh` avec fallback `100vh`. La grille garde le contenu et le lien de défilement dans le flux ; les écrans courts peuvent entraîner une hauteur supérieure à un écran. Le logo conserve 50 % de largeur, jusqu’à 240px ; la signature SVG prend toute la largeur jusqu’à 672px.

L’aurore WebGL OGL conserve ses réglages : blend 0.4, amplitude 0.7, speed 0.2. Sous 1000px, deux couleurs `#1c7743`, `#003b4e` ; à partir de 1000px, trois couleurs `#003b4e`, `#1c7743`, `#003b4e`. Elle recouvre le gradient diagonal `#064134`, `#052430`, `#032430`. Les particules `Trailing` ne sont plus montées sur la landing. Le countdown affiche les jours jusqu’au 17 juillet 2027 à 15h en heure française d’été et se rafraîchit chaque minute ; cette heure n’est pas affichée comme horaire de cérémonie.

Sur téléphone, invitation puis informations s’empilent. Dès 768px, deux panneaux s’étirent à hauteur égale, y compris lorsqu’un détail s’ouvre. `domaine.svg` utilise ses proportions intrinsèques sans crop. Les sections programme, domaine, transport, extérieur et FAQ utilisent `details`/`summary` natifs. Une carte vers `/noces/` est placée avant les FAQ. Le contact utilise `mailto:` vers les deux mariés ; la galerie est annoncée comme indisponible.

Le formulaire de code supprime les espaces en début/fin et encode la valeur dans `/confirmation/?code=...`. Le compteur lit ponctuellement `codes_invitation` et `statuts`, ne compte que les invitations à identifiant de six caractères et membres valides, et reste absent en cas de chargement ou d’erreur.

## Invitation et RSVP

La page de confirmation vérifie l’existence de `codes_invitation/{CODE}`. Les trois listes publiques dans `config/codes.ts` déterminent l’affichage du formulaire, des suggestions de logement et du badge vin d’honneur. Le message vient de Firestore. Elles ne constituent pas un contrôle d’autorisation serveur.

Le formulaire charge les membres de l’invitation et écoute la collection `statuts` avec `onSnapshot`. Une carte sélectionne une personne ; son email optionnel, statut, commentaires et événements sont modifiables. La réponse acceptée d’un invité de week-end exige au moins un événement. Le vin d’honneur masque ces choix. La sauvegarde écrit le document individuel puis horodate l’utilisation de l’invitation : voir [DATA_MODEL.md](DATA_MODEL.md).

Dès 768px, réponse/email et événements utilisent deux colonnes ; les cartes des membres utilisent auto-fit. Le message d’erreur de confirmation propose le même contact e-mail que la landing, sans numéros personnels.

## Pages complémentaires

Les hébergements sont des données locales : type, nom, adresse, distance, téléphone public, site, gamme de prix, capacité, description, prestations et image. Les filtres utilisent la gamme textuelle de prix et une capacité minimale. La route est directement accessible, même si son lien depuis l’invitation dépend d’une catégorie.

Le voyage présente un mois au Japon avec cinq idées d’escales encore provisoires. Chaque entrée possède ville, titre, description, envies et image locale optionnelle. Sans image, un visuel inline SVG est rendu, sans requête vers un service de placeholder. Framer Motion anime les apparitions et l’avion (`useScroll`, `useSpring`, `useTransform`). Les étapes s’empilent sur téléphone et alternent autour d’une ligne centrale dès 768px. `useReducedMotion` désactive les déplacements sur cette page.

L’admin affiche les invitations à code de six caractères ayant un tableau de membres, et joint les réponses par `nom_membre`. Il filtre par statut, code et nom, trie et exporte les résultats filtrés. Le client accepte une session Firebase connectée ; aucun rôle/allowlist admin n’est défini ici.

Les deux galeries n’accordent l’accès apparent que sur la présence d’un `code` non vide dans l’URL. Aucune validation d’invitation ou protection des assets n’est implémentée dans ces pages. Elles sont des prototypes, pas une galerie privée finalisée.

## Assets et accessibilité

Assets sous `public/`, police Wedding et palette CSS dans `app/globals.css`. Lucide sert la navigation/landing/voyage ; Material UI sert notamment RSVP et admin. Le layout désactive globalement la sélection de texte avec `select-none`.

Les boutons ont des tailles adaptées au tactile, les disclosures sont natifs, et les nouveaux liens ont des focus visibles. Les styles de réduction des mouvements de la landing concernent CSS et signature ; l’aurore WebGL continue actuellement son animation. Les limites de chemins d’assets et de l’accès Firebase sont recensées dans [PROJECT_STATE.md](PROJECT_STATE.md).

## Administration refactorée

La route admin gère la session Firebase et la jointure invitations/statuts. Une seule écoute est conservée, nettoyée lors des changements de session et du démontage. Les lectures en échec ont un message visible. La présentation est isolée dans `components/AdminDashboardView.tsx`, sans appels Firebase, pour permettre une vérification avec des données fictives sans contourner la connexion de production.

La palette utilise le bleu/vert du mariage et des badges sobres. Les filtres, tri clavier, états vides et pagination 20/50/100 sont partagés ; les lignes deviennent des cartes sous 1024px. Le tableau a son propre défilement et ses en-têtes restent visibles. Les événements ne comptent que les réponses acceptées. L’export passe tous les résultats filtrés et triés à `lib/rsvp-csv.ts`, indépendamment de la pagination. Les neuf colonnes sont correctement échappées et incluent l’email, sans colonne samedi midi inexistante. Les tests ciblés sont dans `tests/rsvp-csv.test.cjs`.
