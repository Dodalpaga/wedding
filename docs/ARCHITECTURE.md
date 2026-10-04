# Architecture

Référence : code du dépôt au 4 octobre 2026.

## Socle et rendu

Next.js 14.2.5 App Router, React 18, TypeScript en mode strict et Tailwind CSS 3. Le layout racine fixe `lang="fr"`, les métadonnées du mariage, charge les styles globaux et un preload de police. Les composants interactifs utilisent le rendu client React. Les appels Firestore et Authentication partent du navigateur via `lib/firebase.ts` ; il n’y a pas d’API serveur applicative dans le dépôt.

`next.config.js` configure `output: 'export'`, les images non optimisées et les slashs finaux. En production uniquement, `basePath`, `assetPrefix` et `NEXT_PUBLIC_BASE_PATH` sont `/wedding`. Les routes restent sans préfixe en développement. Le workflow GitHub Pages publie `out/`.

## Routes

| Route | Composition et fonctionnement |
| --- | --- |
| `/` | `Hero` + `InfoSection` + `Footer`, sous `.landing-page`. |
| `/confirmation/` | `useSearchParams` sous Suspense, lecture Firestore du code normalisé en majuscules, message d’invitation, catégories, lien d’hébergement et `RSVPFormFirebase`. |
| `/hebergement/` | Suspense, bouton `router.back()` et liste locale de neuf hébergements. |
| `/noces/` | Données `tripSteps`, hero partagé avec fond canvas séquencé, cinq escales et cadeau au premier plan ; retour Accueil dans le cadeau final, sans footer, navbar ni avion. |
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

Le voyage présente un mois au Japon avec cinq idées d’escales encore provisoires. Chaque entrée possède ville, titre, description, envies et image locale optionnelle. Les cartes utilisent une photo en fond et un panneau bleu de marque ; sans image, un dégradé `--primary`/`--secondary` et un placeholder restent disponibles. Les scènes fixes s’enchaînent en fondu devant le hero partagé. Il n’y a plus de timeline/avion, menu, footer, curseur personnalisé ou dépendance Framer Motion sur cette route. La réduction des mouvements garde la première frame statique et tous les contenus dans le flux.

L’admin affiche les invitations à code de six caractères ayant un tableau de membres, et joint les réponses par `nom_membre`. Il filtre par statut, code et nom, trie et exporte les résultats filtrés. Le client accepte une session Firebase connectée ; aucun rôle/allowlist admin n’est défini ici.

Les deux galeries n’accordent l’accès apparent que sur la présence d’un `code` non vide dans l’URL. Aucune validation d’invitation ou protection des assets n’est implémentée dans ces pages. Elles sont des prototypes, pas une galerie privée finalisée.

## Assets et accessibilité

Assets sous `public/`, police Wedding et palette CSS dans `app/globals.css`. Lucide sert la navigation/landing/voyage ; Material UI sert notamment RSVP et admin. Le layout désactive globalement la sélection de texte avec `select-none`.

Les boutons ont des tailles adaptées au tactile, les disclosures sont natifs, et les nouveaux liens ont des focus visibles. Les styles de réduction des mouvements de la landing concernent CSS et signature ; l’aurore WebGL continue actuellement son animation. Les limites de chemins d’assets et de l’accès Firebase sont recensées dans [PROJECT_STATE.md](PROJECT_STATE.md).

## Administration refactorée

La route admin gère la session Firebase et la jointure invitations/statuts. Une seule écoute est conservée, nettoyée lors des changements de session et du démontage. Les lectures en échec ont un message visible. La présentation est isolée dans `components/AdminDashboardView.tsx`, sans appels Firebase, pour permettre une vérification avec des données fictives sans contourner la connexion de production.

La palette utilise le bleu/vert du mariage et des badges sobres. Les filtres, tri clavier, états vides et pagination 20/50/100 sont partagés ; les lignes deviennent des cartes sous 1024px. Le tableau a son propre défilement et ses en-têtes restent visibles. Les événements ne comptent que les réponses acceptées. L’export passe tous les résultats filtrés et triés à `lib/rsvp-csv.ts`, indépendamment de la pagination. Les neuf colonnes sont correctement échappées et incluent l’email, sans colonne samedi midi inexistante. Les tests ciblés sont dans `tests/rsvp-csv.test.cjs`.

## Voyage : hero partagé et cartes en fondu

Depuis le 4 octobre 2026, GSAP/ScrollTrigger synchronise `SequenceBackdrop` et `useJourneyScenes` avec le scroll natif (`scrub: true`, aucun easing additionnel ni seuil de 60 Hz). Le décor utilise une densité adaptée à la longueur du parcours (environ 16 pixels de scroll par position, au maximum 597), sélectionnée uniformément dans les 597 originaux avec conservation des extrémités. Chaque image conserve exactement son fichier WebP et ses pixels 1280×720. La réduction de densité est temporelle, jamais une baisse de résolution ou un nouvel encodage. Quatre téléchargements préparent les blobs par subdivision du parcours. Le buffer décode quatre images en parallèle et conserve désormais 16/24 bitmaps (hors opérations en cours), explicitement libérés ; les données compressées de la séquence sélectionnée restent disponibles. Le masque solaire est préparé hors ligne dans `public/assets/noces-solar-mask.webp`, sans lecture de pixels pendant le scroll. Les fondus des scènes sont complémentaires et ne passent plus par un intervalle vide. [Plan et validation](plans/active/noces-gsap-native-quality.md).

Les textes V1, `TripStep`, ses commentaires et les cinq escales sont conservés. `ScrollHero` compose un décor sticky unique (`SequenceBackdrop`) et huit scènes : introduction, présentation de l’itinéraire, cinq cartes (`TripStages`) et cadeau (`GiftSection`). Le cadeau termine le parcours et propose un Next Link vers Accueil, aussi disponible dans l’introduction. Il n’y a plus d’écran footer, navbar, menu, avion ou curseur personnalisé. La scrollbar reste masquée uniquement sur cette route ; le curseur natif et les focus visibles sont conservés.

La présentation « Nos envies d’escales » affiche la carte fournie par les propriétaires (`public/images/noces/trip-overview.webp`) à gauche dès 768px et le texte à droite ; sur téléphone, le texte reste au-dessus de la carte. Le fichier conserve sa transparence et ses dimensions originales, affiché en contain ; contraste/saturation et ombre sont traités en CSS uniquement. L’introduction occupe la largeur disponible avec une marge latérale de 1,5 à 4rem. L’ombre gris foncé (`rgb(24 24 24)`) suit une diagonale de 45° : opacité 88 % jusqu’à 33 %, 42 % à 66 %, puis transparence en haut à droite. Sous 768px ou sous 601px de hauteur, le fond reste plus sombre sur toute la largeur. `solar-rays.ts` remplace la texture statique par un canvas transparent en screen, sous le voile de lisibilité. Il simule des faisceaux chauds en perspective, leur élargissement à l’approche et les variations de lumière dans la canopée. Deux tiers des faisceaux peuvent s’élargir progressivement jusqu’à ×4 ; leur gain lumineux varie jusqu’à ×3, avec saturation naturelle des cœurs lumineux. Un tiers reste fin pour conserver du détail. Ces variations suivent le scroll dans les deux sens et ne rajoutent aucun dessin de sprite. Un atlas de transmission préparé hors ligne à partir des originaux atténue les faisceaux sur les troncs/feuilles sombres : c’est une approximation 2D, pas un ray tracing physique. Le crop cover est identique à la séquence. Le canvas est plafonné à 480px sur téléphone (9 faisceaux), 720px ailleurs (14), sans DPR supplémentaire ; le masque est plafonné à 128px sur téléphone et 160px ailleurs. La transmission est précalculée hors ligne ; aucune lecture de pixels de la frame visible n’est nécessaire. Le sprite doux est généré une seule fois, sans filtre blur, dépendance ou asset téléchargé. La taille interne du renderer et de son masque est initialisée indépendamment des dimensions déjà conservées par le canvas vidéo : cela couvre la réexécution des effets React en développement (Strict Mode/Fast Refresh). Un resize à taille identique ne réinitialise pas le canvas lumineux. Les rayons utilisent la frame réellement affichée et la boucle existante ; aucun rendu au repos ni dans un onglet masqué. La réduction des mouvements masque et efface les rayons. Sans JavaScript, le poster reste seul. Les textures et `background-treatment.ts` sont conservés comme historique, inutilisés.

`StepDrawer` utilise `details`/`summary` natifs pour les descriptions et highlights. Sous 768px ou sous 601px de hauteur, chaque volet est fermé au départ : le panneau fermé affiche uniquement le numéro, la ville et un chevron dans une commande native de 44px minimum. Les libellés redondants disparaissent sur petits écrans ; les textes complets restent dans le volet. La hauteur du contenu ouvert s’adapte au viewport (plafond 38svh/360px et réserve pour le titre/commandes), et peut défiler indépendamment du parcours ; il est focusable au clavier. Sur grands écrans, les détails sont ouverts et la commande est masquée. Le changement de breakpoint réapplique l’état par défaut. Sans JavaScript, la commande native reste disponible à toutes les tailles. Les effets sont nettoyés au démontage et aucun état React n’est mis à jour pendant le scroll.

`FRAME_SEQUENCE` dans `components/noces/frame-sequence.ts` regroupe le motif `/assets/torii-better-fps-frames/frame-{frame}.webp`, le nombre 597, le padding 6 et les limites du renderer. Les frames extraites de `Torii_better_fps.mp4` restent à leur résolution native 1280×720, sans crop ni suppression de frames. Le choix des limites mobile/desktop est stable pendant une visite. Toutes les URLs des frames et photos passent par `NEXT_PUBLIC_BASE_PATH`.

`SequenceBackdrop` télécharge la sélection entière sous forme compressée avec quatre transferts simultanés et priorité à la position demandée. Ces blobs restent accessibles pendant la visite (environ 38/76/60 Mo dans les trois formats testés). `JourneyFrameBuffer` organise la fenêtre de décodage directionnelle, avec quatre opérations simultanées et 16/24 bitmaps téléphone/PC. Une voie reste disponible pour l’image actuelle ; les préparations spéculatives occupent au maximum trois opérations. SequenceBackdrop applique ces limites et une anticipation de décodage 9/15 par-dessus le profil de FRAME_SEQUENCE. La borne monotone est réinitialisée à chaque inversion pour éviter de bloquer une image en retard ; un premier recalage peut être visible, puis la progression reste monotone. Il conserve le dernier bitmap présenté jusqu’à son remplacement, récupère les décodages tardifs utiles et ferme explicitement les autres images. Les anciens profils deviceMemory/saveData du buffer réseau ne sont plus appliqués par ce composant.

L’onglet masqué suspend les nouveaux travaux ; les transferts réseau déjà lancés peuvent terminer. la réduction des mouvements vide le cache compressé et ne prépare que la première frame. Les bitmaps sont explicitement libérés via `ImageBitmap.close()` ; les résultats obsolètes sont libérés même après démontage. Le décodage asynchrone utilise `createImageBitmap`, avec fallback `Image.decode`. Un téléchargement futur seul ne déclenche aucun dessin. La première frame possède aussi un poster HTML utilisable avant le canvas ou sans JavaScript. Une frame en échec laisse le poster ou le bitmap chargé le plus proche, sans boucle de tentatives infinie. Le préchargement augmente les données anticipées mais ne garantit pas la fluidité avant réception sur réseau lent ; charger toutes les frames décodées demanderait environ 2,05 Gio et reste exclu.

Le canvas reste en cover, sans transformer les originaux, plafonné à 1280px sur le grand côté et à DPR 2. GSAP pilote le progrès et dessine directement dans son callback synchronisé ; les notifications asynchrones de décodage restent regroupées dans un raf. Les dessins sans changement de bitmap ou de taille sont ignorés. Il n'y a aucun re-render React par frame, easing supplémentaire ou seuil à 60 Hz. ScrollTrigger conserve ses propres tâches de synchronisation au repos ; le renderer ne dessine pas continuellement. Le décor et les panneaux évitent les filtres backdrop-blur.

`useJourneyScenes` active les scènes absolues dans un premier plan sticky, sur une hauteur de `(nombre de scènes − 1) × 120svh + 100svh`. ScrollTrigger synchronise leurs fondus complémentaires entre les fractions 0,25 et 0,75 : la somme des opacités reste à 1. La scène active arrondie est interactive ; les autres sont `inert` et `aria-hidden`. Les boutons et ancres se traduisent en positions de scroll ; le focus rejoint la scène cible. Sur écrans courts, le défilement intérieur conserve tous les textes. Les photos locales sont en lazy dans le HTML ; le profil mobile/tactile les prépare séquentiellement avec Image.decode après activation des scènes. Le profil PC conserve le chargement natif. Les mises à jour ScrollTrigger des fondus sont directes, sans raf supplémentaire. Les cartes restent sans translation. Sources : [VIDEO_FRAMES.md](VIDEO_FRAMES.md).

En réduction des mouvements, seule la première frame est chargée/dessinée, sans easing. Sans JavaScript et en réduction des mouvements, tous les contenus restent accessibles dans le flux ; pas de longues zones vides ni de scènes masquées. Les cibles interactives mesurent au moins 44px et gardent un focus visible.
