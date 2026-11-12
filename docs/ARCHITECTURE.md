# Architecture

## Rendu et routes

Next.js 14.2.5 App Router, React 18, TypeScript strict et Tailwind CSS 3. `app/layout.tsx` dÃ©finit la langue franÃ§aise, les mÃ©tadonnÃ©es et les styles globaux. Les composants interactifs utilisent React cÃ´tÃ© client. Aucun serveur/API applicatif : Firestore et Authentication sont appelÃ©s depuis le navigateur via `lib/firebase.ts`.

`next.config.js` utilise `output: 'export'`, des images non optimisÃ©es et des slashs finaux. `NEXT_PUBLIC_BASE_PATH`, `basePath` et `assetPrefix` valent `/wedding` en production, vide en dÃ©veloppement. Les routes internes utilisent Next Link/router. Les deux galeries conservent l'orthographe `gallerie`.

| Route | Composition |
| --- | --- |
| `/` | `Hero`, `InfoSection`, `Footer`. |
| `/confirmation/` | Lecture du code sous Suspense, invitation, flags et `RSVPFormFirebase`. |
| `/hebergement/` | Liste locale filtrable et bouton de retour. |
| `/noces/` | `NocesVoyage` : couverture washi, Tokyo (néon), transition shinkansen, Nara (washi), transition torii, Osaka (néon), Okinawa (lagon et sable), lettre. |
| `/admin/` | Session Firebase, jointure invitations/statuts et `AdminDashboardView`. |
| `/gallerie/`, `/gallerie-cloud/` | Albums de dÃ©monstration, lightbox ou liens OneDrive. |

## Landing

Le hero garde au moins `100svh` (fallback `100vh`) et peut grandir sur Ã©cran court. Le logo occupe 50 % de largeur, jusqu'Ã  240px ; la signature SVG est Ã  pleine largeur, jusqu'Ã  672px. `domaine.svg` garde son ratio entier. L'aurore OGL conserve blend 0.4, amplitude 0.7, speed 0.2 ; deux couleurs `#1c7743`, `#003b4e` sous 1000px, trois `#003b4e`, `#1c7743`, `#003b4e` au-delÃ .

Le countdown cible le 17 juillet 2027 Ã  15h en heure franÃ§aise d'Ã©tÃ©, sans prÃ©senter cette heure comme horaire de cÃ©rÃ©monie. Les panneaux RSVP/informations s'empilent sur tÃ©lÃ©phone et s'alignent dÃ¨s 768px. Les dÃ©tails utilisent `details`/`summary`, avec focus visibles. Le contact est un e-mail ; les hÃ©bergements ont leurs propres coordonnÃ©es publiques. Programme et itinÃ©raire restent provisoires.

Le formulaire nettoie les espaces autour du code et encode l'URL de confirmation. Le compteur lit les invitations Ã  identifiants de six caractÃ¨res et les statuts ; il reste absent en cas d'erreur.

## Invitation et administration

La confirmation vÃ©rifie l'existence du code Firestore, normalisÃ© en majuscules. Les flags `participation_repas === false` et `couchage_sur_place === false` pilotent respectivement le badge vin d'honneur et le lien vers les hÃ©bergements extÃ©rieurs. Un champ manquant n'est pas assimilÃ© Ã  `false`. Seule `NEXT_PUBLIC_CODES_RSVP` dÃ©termine l'affichage du formulaire. [SchÃ©ma et Ã©critures](DATA_MODEL.md).

L'admin Ã©coute les rÃ©ponses, joint les membres par nom, filtre et trie les rÃ©sultats. Le tableau devient des cartes sur tÃ©lÃ©phone ; la pagination propose 20/50/100 rÃ©sultats. Les ratios repas/couchage sont globaux ; le CSV exporte tous les rÃ©sultats filtrÃ©s/triÃ©s. Les erreurs de lecture restent visibles.

Les galeries exigent uniquement un code non vide dans l'URL ; elles ne valident pas l'invitation et ne protÃ¨gent pas les images. L'admin accepte une session Firebase connectÃ©e sans rÃ´le/allowlist versionnÃ©. Le dÃ©pÃ´t ne contient pas les rÃ¨gles Firebase : ces interfaces ne prouvent pas une autorisation serveur.

Le tableau admin utilise des indicateurs de présence compacts et des cartes synthétiques sur téléphone. Le bouton « Mode édition » rend les champs RSVP de tous les invités de la page directement modifiables, en tableau sur ordinateur et en cartes sur téléphone. Les filtres et la pagination sont suspendus pendant l'édition ; les changements se sauvegardent ensemble ou s'annulent. Le nom et les flags d'invitation ne sont pas modifiables depuis cet éditeur.

L'authentification Firebase contrôle l'accès à l'interface, mais ne constitue pas une autorisation serveur. Les règles indiquées pour `statuts` autorisent les écritures publiques ; elles doivent être revues séparément si les modifications administratives doivent être restreintes.

## Voyage Noces

`app/noces/` regroupe la page : `NocesVoyage.tsx` (sections), `NocesArt.tsx` (icônes néon et tampons SVG), `CityArt.tsx` (logo peint et illustrations d'ouverture des chapitres), `Scene3D.tsx` (transition épinglée), `scenes.ts` (scènes Three.js), `peel.ts` (géométrie du décollage), `scroll-effects.ts` (progression `--p` et apparitions) et `noces.css` (styles préfixés `fx-`).

Les sections alternent papier washi et nuit néon dans la palette du site. Le chapitre Tokyo reprend l'aurore de la landing (mêmes réglages, montée seulement près de l'écran) et quatre envies en défilement horizontal épinglé. Nara présente un carnet de tampons et trois mots ; Osaka des envies culinaires animées ; Okinawa, au thème propre, un lagon lumineux puis des cartes postales sur le sable ; la lettre finale, chiffonnée et tamponnée, occupe exactement un écran. Aucune escale ni horaire n'est figé.

Les ouvertures de chapitres portent une illustration SVG inline (`CityArt.tsx`, `aria-hidden` sauf le cerf et le logo) :

- **Logo de couverture** : le monogramme est repeint au pinceau, comme l'ancien ensō, sans réutiliser le fichier du logo (50 % de largeur, 240 px au plus). Quatre coups de pinceau dans l'ordre d'écriture (anneau gauche, S, fût du D, panse du D, environ 4 s) : chacun suit une ligne médiane et un profil d'épaisseur relevés sur `SD Logo white.svg` (viewBox 1080). Il est peint poil par poil : une vingtaine de tracés parallèles dont ceux du bord s'assèchent plus tôt et se cassent (pointillés irréguliers, « pinceau volant »), au-dessus d'un lavis flou qui figure la diffusion de l'encre ; les variations (pression, sécheresse, teinte) sont déterministes. Cette géométrie (environ 90 tracés) est calculée dans le navigateur au montage pour ne pas alourdir le HTML statique. Chaque coup est découvert le long de sa ligne médiane par un masque animé aux bords irréguliers. Si le logo change, il faut reprendre ces relevés.
- **Tokyo** : la Tokyo Skytree seule, peinte à la gouache claire sur la nuit, dans l'esprit du cerf de Nara : silhouette au lavis granuleux, arêtes, mât et plateformes peints poil par poil (même `paintBrush` que le logo, calculé dans le navigateur), croisillons à main levée, ville en taches d'aquarelle, feu de balisage et sceau 塔 au vermillon. Elle se peint au fil du scroll (`--paint` dérivé du `--p` de l'ouverture de Tokyo, p ≈ 0,18 → 0,5). À gauche sur téléphone, au centre sur PC, toujours au-dessus du texte.
- **Nara** : cerf sika au lavis et pinceau sec devant la pagode du Kōfuku-ji, soleil vermillon et sceau 鹿. Chaque trait est révélé par un masque « coup de pinceau » piloté par `--paint`, dérivé du `--p` de la transition shinkansen : le cerf se peint pendant que le rideau se décolle (p ≈ 0,45 → 0,87).
- **Osaka** : guirlande de chōchin (食, 酒, 祭, 串, 蛸) qui se balancent et s'allument une fois le torii franchi.

Chaque transition est une section épinglée (`260svh`, scène sticky en `100lvh`) : la progression du scroll est lissée puis pilote la scène. Three.js et les modèles ne se chargent qu'à l'approche ; le canvas est transparent et le rendu s'arrête hors écran.

- **Shinkansen** : deux motrices N700 dos à dos traversent l'écran ; une ficelle de longueur fixe, attachée à la queue, décolle depuis le coin supérieur droit l'« autocollant » de la nuit de Tokyo (découpe CSS `clip-path` et rabat SVG calculés par `peel.ts`), qui découvre l'introduction du chapitre Nara.
- **Torii** : le torii et deux lanternes projettent leur ombre sur le papier ; l'introduction du chapitre Osaka est visible dans l'ouverture, découpée par projection des coins mesurés sur le modèle (piliers et traverse basse), jusqu'à remplir l'écran.

Le chapitre Okinawa s'ouvre sur `OkinawaLagoon` : vagues `react-wavify`, eau découpée par le tracé de la vague de premier plan (`clip-path` mis à jour à chaque image) fond marin photographié (`public/images/noces/okinawa-recif.webp`, chargé avec `NEXT_PUBLIC_BASE_PATH`) déformé par un shader `Water` et flouté, teinte lagon, reflets de surface par un second `Water` sans image, et rayons `GodRays` de `@paper-design/shaders-react` (WebGL, pause hors écran, vitesse nulle avec la réduction des mouvements).

D'autres shaders `@paper-design/shaders-react` décorent la page via `ShaderLayer.tsx` : papier washi `PaperTexture` (couverture, tampons et trois mots de Nara), feuille pliée et froissée de la lettre (`PaperTexture`), reflets de canal `Warp` en fond d'Osaka et sable `GrainGradient` sous les cartes d'Okinawa. Chaque calque n'est monté qu'à l'approche de l'écran (`IntersectionObserver`, marge 200 à 400 px) et démonté ensuite, ce qui libère son contexte WebGL ; les fonds CSS d'origine restent en dessous comme repli. Les papiers et le sable sont figés (vitesse 0) ; les reflets s'arrêtent avec la réduction des mouvements.

Avec `prefers-reduced-motion`, les sections ne sont plus épinglées, la 3D est omise et les chapitres révélés s'affichent directement ; logo, cerf, Skytree et lanternes apparaissent dans leur état final, sans animation. La page masque sa barre de défilement. [Modèles et crédits](NOCES_MODELS.md).

## Assets et contraintes

Les fichiers diffusÃ©s sont dans `public/`. Les modÃ¨les originaux et signatures de rÃ©fÃ©rence sont dans `assets/`, hors export. Les scripts de prÃ©paration et tests sont sÃ©parÃ©s des routes. Les coordonnÃ©es personnelles, codes, rÃ©ponses et exports d'invitÃ©s ne doivent pas entrer dans le dÃ©pÃ´t. VÃ©rifier le RSVP sans Ã©crire dans la base rÃ©elle.
