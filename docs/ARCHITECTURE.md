# Architecture

## Rendu et routes

Next.js 14.2.5 App Router, React 18, TypeScript strict et Tailwind CSS 3. `app/layout.tsx` dÃ©finit la langue franÃ§aise, les mÃ©tadonnÃ©es et les styles globaux. Les composants interactifs utilisent React cÃ´tÃ© client. Aucun serveur/API applicatif : Firestore et Authentication sont appelÃ©s depuis le navigateur via `lib/firebase.ts`.

`next.config.js` utilise `output: 'export'`, des images non optimisÃ©es et des slashs finaux. `NEXT_PUBLIC_BASE_PATH`, `basePath` et `assetPrefix` valent `/wedding` en production, vide en dÃ©veloppement. Les routes internes utilisent Next Link/router. Les deux galeries conservent l'orthographe `gallerie`.

| Route | Composition |
| --- | --- |
| `/` | `Hero`, `InfoSection`, `Footer`. |
| `/confirmation/` | Lecture du code sous Suspense, invitation, flags et `RSVPFormFirebase`. |
| `/hebergement/` | Liste locale filtrable et bouton de retour. |
| `/noces/` | `NocesJourney`, globe, nuages, deux expÃ©riences japonaises et carte Kinkakuji finale. |
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

## Voyage Noces

MapLibre/CARTO affiche la France entiÃ¨re, suit le vol Toulouseâ€“Tokyo et termine sur le Japon entier. Le titre finit de disparaÃ®tre avant le premier mouvement. Le zoom compense la latitude pour garder une taille constante en vol. Tuiles, modÃ¨les et shaders sont prÃ©parÃ©s avant de libÃ©rer le scroll ; les erreurs proposent RÃ©essayer ou Passer le voyage. Le cache conserve les ressources de la visite et les libÃ¨re au dÃ©montage.

La scÃ¨ne sticky utilise `100lvh` (fallback `100vh`) pour couvrir le repli de la barre d'adresse mobile. Le parcours est en `svh`, avec progrÃ¨s calculÃ© sur la hauteur rÃ©elle de la scÃ¨ne ; les translations Tokyo/Inakaya sont relatives Ã  leur propre hauteur. Les nuages OGL rÃ©vÃ¨lent Tokyo. Three.js anime le train au scroll, traverse l'entrÃ©e d'Inakaya et revient Ã  l'extÃ©rieur. Kinkakuji termine le parcours, avec crÃ©dits et textes de clÃ´ture. [ModÃ¨les et rendu](NOCES_MODELS.md).

Le cube du temple tourne au survol/clavier ou par inclinaison relative du tÃ©lÃ©phone. La camÃ©ra et le cadre restent fixes. Le premier capteur valide dÃ©finit le neutre ; si une permission est nÃ©cessaire, elle est demandÃ©e par un bouton et la calibration suit l'autorisation. Recentrage et portrait/paysage sont gÃ©rÃ©s. Rendu uniquement lors des interactions, suspendu hors Ã©cran/onglet masquÃ©. La rÃ©duction des mouvements garde modÃ¨les et textes accessibles dans le flux.

## Assets et contraintes

Les fichiers diffusÃ©s sont dans `public/`. Les modÃ¨les originaux et signatures de rÃ©fÃ©rence sont dans `assets/`, hors export. Les scripts de prÃ©paration et tests sont sÃ©parÃ©s des routes. Les coordonnÃ©es personnelles, codes, rÃ©ponses et exports d'invitÃ©s ne doivent pas entrer dans le dÃ©pÃ´t. VÃ©rifier le RSVP sans Ã©crire dans la base rÃ©elle.
