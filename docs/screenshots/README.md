# Captures d’écran

Captures de référence et preuves visuelles des étapes de travail des 3 et 4 octobre 2026. Elles ne sont pas régénérées automatiquement ; une image ancienne ne prime pas sur le code et les décisions actuelles. Les nouvelles captures de l’admin utilisent des données fictives ; la capture originale admin.png fournie par les propriétaires contient des données d’invités.

## État initial fourni par les propriétaires

- [landing_page.png](landing_page.png) : landing avant refactoring.
- [noces_page.png](noces_page.png) : voyage avant refactoring, avec grandes images manquantes et bouton Accueil détaché.

## Landing : étapes historiques

| Fichier | Portée |
| --- | --- |
| [landing_desktop_refactored.jpg](landing_desktop_refactored.jpg) | Premier refactoring desktop. |
| [landing_mobile_refactored.jpg](landing_mobile_refactored.jpg) | Premier hero mobile compact, depuis remplacé. |
| [landing_mobile_rsvp.jpg](landing_mobile_rsvp.jpg) | Zone du code d’invitation sur mobile. |
| [landing_desktop_adjusted.jpg](landing_desktop_adjusted.jpg) | Ajustement des panneaux et du layout desktop. |
| [landing_tablet_adjusted.jpg](landing_tablet_adjusted.jpg) | Ajustement tablette. |
| [landing_mobile_adjusted.jpg](landing_mobile_adjusted.jpg) | État mobile intermédiaire avant hero plein écran. |
| [landing_mobile_fullscreen.jpg](landing_mobile_fullscreen.jpg) | Vérification du hero plein écran sur mobile. |

Ces captures précèdent la restauration finale de l’aurore et des dimensions du logo/noms, ainsi que le lien vers le voyage. Elles attestent les étapes vérifiées, pas l’apparence finale complète.

## Voyage refactoré

- [noces_mobile_refactored.jpg](noces_mobile_refactored.jpg) : bannière avec retour Accueil, présentation d’un mois et introduction de l’itinéraire.
- [noces_desktop_refactored.jpg](noces_desktop_refactored.jpg) : début du parcours avec textes, illustrations provisoires, alternance des colonnes et avion.

Les villes et descriptions restent des pistes modifiables ; les cartes illustrées sont des placeholders volontaires.

## Administration

admin.png est la capture initiale fournie par les propriétaires ; elle contient des informations d’invités. Les nouvelles captures [admin_desktop_refactored.jpg](admin_desktop_refactored.jpg) et [admin_mobile_refactored.jpg](admin_mobile_refactored.jpg) utilisent uniquement des invités fictifs.

## Première V2 (historique)

Les captures V1 ci-dessus sont historiques : hero et placeholders sont remplacés en V2. Export de production testé sous /wedding/, sans accès Firebase, le 3 octobre 2026.

- [Hero 320px](noces-v2/320-hero.png), [hero 390px](noces-v2/390-hero.png), [hero PC](noces-v2/1440-hero.png).
- [Timeline tablette](noces-v2/820-timeline.png), [séquence au scroll](noces-v2/1440-sequence.png).
- [Menu mobile](noces-v2/390-menu.png), [cadeau et footer](noces-v2/1440-gift.png).
- [Réduction des mouvements](noces-v2/reduced-motion.png).

Ces captures documentent le responsive et les visuels ; les mesures de performances sur appareil physique/réseau lent restent à réaliser.

## Premier hero unique et performances (historique)

Le hero séparé, la navbar/menu et la timeline/avion de la première V2 sont remplacés. Un fond séquencé unique accompagne les textes des cinq escales au premier plan, puis le cadeau et le footer. Captures de l’export de production sous `/wedding/`, sans lecture/écriture Firebase :

- [Introduction 320px](noces-hero/320-intro.png), [390px](noces-hero/390-intro.png), [PC](noces-hero/1440-intro.png).
- [Tokyo mobile](noces-hero/320-step-1.png), [Kyoto tablette](noces-hero/820-step-3.png), [Tokyo PC](noces-hero/1440-step-1.png), [dernière escale PC](noces-hero/1440-step-5.png).
- [Cadeau mobile](noces-hero/390-gift.png), [réduction des mouvements](noces-hero/reduced.png).
- [Rapport de performances](noces-hero/performance-report.json) : avant/après dans Chrome headless, 390×844/DPR 2, CPU ralenti ×4 ; scroll normalisé sur la séquence. Mesure ponctuelle, sans prétendre mesurer un téléphone physique ou un réseau lent.

## Cartes photo et scènes fixes en fondu (état actuel)

Séquence Torii 597 frames, cartes fixes qui disparaissent avant la suivante, cadeau en dernière scène avec retour Accueil ; suppression du footer et du curseur personnalisé. Export de production sous `/wedding/`, cinq tailles vérifiées :

- [Tokyo 390px](noces-fades/390-tokyo.png), [bas de carte sur écran court 320px](noces-fades/320-card-bottom.png).
- [Hakone PC](noces-fades/1440-hakone.png), [Ishigaki tablette](noces-fades/820-ishigaki.png).
- [Cadeau et retour Accueil](noces-fades/390-gift.png), [réduction des mouvements](noces-fades/reduced.png).
- [Rapport UI](noces-fades/ui-report.json), [mesure de performances](noces-fades/performance-report.json). Chrome headless ; mesure indicative avec CPU ×4, sans garantie sur téléphone physique/réseau mobile.

## Carte du parcours et fond allégé (historique)

Carte transparente fournie par les propriétaires, placée à droite sur tablette/PC et sous le texte sur téléphone. Voile bleu du décor réduit ; textes et parcours inchangés.

- [Vue d’ensemble PC](noces-map/1440-overview.png), [mobile](noces-map/390-overview.png), [tablette](noces-map/820-overview.png).
- [Introduction et fond allégé](noces-map/390-intro.png), [rapport responsive](noces-map/ui-report.json).

Export sous `/wedding/`, cinq tailles, réduction des mouvements et fallback sans JavaScript vérifiés. Les captures précédentes conservent la trace des voiles de fond plus soutenus.

## Hero cinématique et volets compacts (étape précédente)

Dégradé plus sombre à gauche, introduction élargie, carte à gauche et texte à droite sur grands écrans. Escales réduites au numéro/ville et commande d’ouverture sur téléphone/écran court.

- [Hero PC](noces-drawers/1440-intro.png), [hero téléphone](noces-drawers/390-intro.png), [carte et texte inversés](noces-drawers/1440-overview.png).
- [Tokyo fermé](noces-drawers/390-closed.png), [Tokyo ouvert](noces-drawers/390-open.png), [ouvert sur écran court](noces-drawers/320-open.png).
- [Rapport UI](noces-drawers/ui-report.json) : six tailles, cinq volets, clavier, tactile, resize, reduced motion, no-JS et arrêt du rendu au repos. Export sous `/wedding/`, aucun appel Firebase ni écriture.

## Ombre diagonale et panneau mobile minimal (texture discrète précédente)

- [Texture 2 : ombres, active](noces-shadows/texture2.png), [texture 1 : fuite de lumière](noces-shadows/texture1.png) : même frame et même dégradé gris, variantes testées séparément.
- [Hero téléphone](noces-shadows/390-intro.png), [Tokyo fermé](noces-shadows/390-closed.png), [Tokyo ouvert](noces-shadows/390-open.png), [écran court](noces-shadows/320-open.png).
- [Rapport UI](noces-shadows/ui-report.json) : six tailles, cinq volets, clavier/tactile, no-JS, reduced motion et arrêt au repos. Tests Chrome headless sous `/wedding/`, sans mesure de fluidité sur téléphone physique ni écriture Firebase.

## Texture 2 accentuée (étape précédente)

- [PC](noces-shadows/strong-1440.png), [tablette](noces-shadows/strong-820.png), [téléphone](noces-shadows/strong-390.png) : multiply 80 %, masque étendu, dégradé gris allégé sur PC, téléphone toujours sombre.
- Aperçus du CSS et de l’opacité actuels appliqués à l’export précédent, Chrome headless ; aucun débordement horizontal. TypeScript validé. Pas de nouveau build pour ce réglage visuel limité, ni nouveau contrôle fonctionnel complet des volets inchangés.

Le dégradé sombre original a ensuite été rétabli avec les réglages de texture des propriétaires (screen à 100 %). Les captures ci-dessus ne représentent pas cette dernière combinaison.


## Rayons solaires au scroll — 4 octobre 2026

- [Téléphone 320×568](noces-solar-rays/solar-320-intro.png), [tablette 820×1180](noces-solar-rays/solar-820-intro.png), [PC 1440×900](noces-solar-rays/solar-1440-intro.png) et [écran court 844×390](noces-solar-rays/solar-844-intro.png) : rayons procéduraux, voile de lisibilité conservé.
- [PC après un léger scroll](noces-solar-rays/solar-1440-advanced.png) : variation des faisceaux synchronisée à la vidéo ; la scène commence aussi son fondu normal. Une capture fixe ne montre pas le mouvement.
- [Rapport UI et parcours](noces-solar-rays/solar-report.json) : avant/arrière, resize, clavier, réduction des mouvements, no-JS, zéro rendu au repos.
- [Mesure CPU avant/après](noces-solar-rays/solar-performance.json) : Chrome headless 390×844, CPU ×4, scroll normalisé sur les premiers 15 % de la séquence ; coûts des callbacks et traitement solaire seul. Pas de garantie de FPS sur appareil physique.

Aucune donnée Firebase lue/écrite et aucun déploiement. Les captures de textures précédentes restent historiques.


### Intensité accentuée : réglage actuel

Rayons ponctuellement jusqu’à ×4 en largeur et gain lumineux jusqu’à ×3 ; les captures et mesures de la première intensité ci-dessus restent historiques. [Téléphone](noces-solar-rays/solar-emphasis-320.png), [tablette](noces-solar-rays/solar-emphasis-820.png), [PC](noces-solar-rays/solar-emphasis-1440.png), [PC après scroll](noces-solar-rays/solar-emphasis-1440-scroll.png) et [contrôles](noces-solar-rays/solar-emphasis-report.json). Résolutions et nombre de dessins inchangés ; aucune nouvelle mesure comparative CPU/FPS pour ce réglage.


### Correction de l’initialisation en mode dev

[Serveur npm run dev après correction](noces-solar-rays/solar-dev-fixed.png) : rayons visibles au scroll sur /noces/ sans préfixe, après réexécution des effets React en Strict Mode. Le canvas solaire initialise désormais sa taille et son masque même lorsque le canvas vidéo conserve ses dimensions.


## Passe performances finale, design inchangé

[Budgets mémoire et identité du moteur solaire](noces-performance-final/memory.json), [rendu avant/après CPU ×4](noces-performance-final/runtime.json), [parcours et responsive](noces-performance-final/ui.json). Historique : caches compressés 12/24 Mio désormais remplacés par le buffer réseau ci-dessous. Les mesures de callbacks ne prouvent pas un gain de FPS et ne couvrent pas toute la mémoire/GPU.

## Buffer réseau, design inchangé

[Méthode, comparaison sous latence et contrôles](noces-network-buffer/README.md). Budgets compressés 48/96 Mio et adaptation mémoire/connexion. Préchargement et décodage indépendants ; captures accentuées et dev toujours représentatives du rendu.

## GSAP et qualité native — 4 octobre 2026

[Méthode, résultats et limites](noces-gsap-adaptive/README.md). Images natives et parcours vérifiés sur trois formats ; l’absence de lag à toute vitesse n’est pas démontrée. Les variantes GSAP antérieures et les essais de promotion CSS restent historiques.

## Pauses résiduelles après GSAP

[Comparaison avant/après et limites](noces-last-stutters/README.md). Préparation des photos sur mobile/tactile et mise à jour dans le callback ScrollTrigger ; les pauses résiduelles et le réseau froid restent documentés.

## Décodage prioritaire et mémoire

[Comparaison et limites](noces-decoder-priority/README.md). Cache de bitmaps réduit, voie urgente, images natives inchangées ; les tâches longues résiduelles restent présentes.

## Inversions rapides sur Chrome Windows

[Diagnostic du blocage et validation](noces-reversal-freeze/README.md). Recalage initial explicitement distingué des retours incorrects ; les pauses de composition restent documentées.
