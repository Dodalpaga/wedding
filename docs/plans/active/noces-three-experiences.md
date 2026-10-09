# Noces : trois expériences japonaises

Demande du 9 octobre 2026. Conserver France → globe → Japon, avion, préparation complète et sortie sous les nuages. Supprimer les anciennes scènes Tokyo/Fuji et bambous ainsi que leurs documents et captures obsolètes, à la demande explicite des propriétaires.

Après les nuages :
1. Littlest Tokyo à gauche, texte à droite ; animation existante du train pilotée par le scroll.
2. Inakaya à droite, texte à gauche ; restaurant entier → entrée → plats → cuisine/outils → retour extérieur. Trois textes successifs, puis sortie vers la scène suivante.
3. Carte Kinkakuji à gauche, texte culturel à droite ; parallaxe au pointeur après le parcours du restaurant.

Sur téléphone, modèles et textes s'empilent pour préserver leur lisibilité. Réduction des mouvements : vues fixes et textes accessibles. Toutes les ressources, textures et shaders doivent être prêts avant de libérer le scroll.

- [x] Retirer les anciens moteurs et documents après les nuages.
- [x] Inspecter les trois GLB, leurs animations, matériaux et crédits.
- [x] Générer des versions web allégées en conservant les sources fournies.
- [x] Intégrer les trois expériences, préparation commune, scroll et survol.
- [ ] Vérifier responsive, caméra, marche arrière, repos, réseau, erreurs et accessibilité.
- [ ] TypeScript, export isolé, documentation et captures finales.

Aucun achat, déploiement ou écriture Firebase. Les titres de contenu sont proposés en français, conformément à la langue du site ; l'itinéraire reste provisoire.

Ajustements demandés pendant la vérification : rotation réelle du cube du temple plutôt que déplacement de caméra/rotation CSS ; Tokyo révélé sous les nuages par translation continue ; entrée Inakaya sous le rideau et vues intérieures larges plutôt que gros plans sur les plats ; occlusion SSAO et ombres portées sur Tokyo et Inakaya. Géométrie de l'entrée inspectée par intersections : le corridor choisi évite les murs et le rideau. La porte vitrée existante n'a pas d'animation d'ouverture ; elle est traversée à son emplacement.
