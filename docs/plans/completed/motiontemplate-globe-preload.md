# Préparer le globe avant le scroll

Complément : cadrages des pays entiers, seconde passe aux dimensions visibles et corps vectoriels conservés pendant la visite. Les expériences après les nuages font l’objet du [nouveau plan](../active/motiontemplate-three-experiences.md).

## Demande du 8 octobre 2026

Charger toute la cartographie nécessaire au trajet Toulouse–Tokyo avant de lancer la séquence, afin d'éviter son apparition progressive pendant le défilement. Conserver le moteur du globe COG et le rendu des deux étapes.

## Travail

- [x] Identifier la couverture de tuiles/glyphes du trajet et leur rétention MapLibre.
- [x] Préparer les vues derrière un écran de chargement, avec progression et traitement des erreurs.
- [x] Libérer la séquence seulement après la préparation ; préserver les replis et la réduction des mouvements.
- [x] Contrôler les demandes réseau pendant le scroll avant/arrière, avec cache HTTP désactivé.
- [x] Vérifier téléphone, tablette, PC, resize et clavier ; TypeScript, tests ciblés et export isolé.
- [x] Actualiser les documents et les limites de la vérification.

Aucun accès Firebase, RSVP soumis ou déploiement. Les données cartographiques sont conservées pour la visite en cours, puis libérées au démontage.

## Résultats et limites

Six tests de préparation, trois tests du trajet, TypeScript et export isolé validés. Les visites Chrome avec cache HTTP désactivé couvrent 320×568, 820×1180, 1440×900, resize 390×844 et parcours haute densité DPR 2. Zéro requête CARTO au scroll ; erreur/retry/passage, clavier, réduction des mouvements et no-JS contrôlés. Double montage React en développement validé. [Rapport](../../screenshots/motiontemplate-globe-preload/README.md).

Le temps initial varie avec le réseau et le GPU ; pas de mesure sur téléphone physique ni réseau lent. La couverture porte sur le trajet, avec marge de 256px, et le viewport préparé. Une nouvelle taille entraîne une préparation supplémentaire. Les vues sont sélectionnées parmi 769 positions, et le cache décodé est plafonné à 2048 tuiles par source. Aucun cache persistant ajouté ni accès/écriture Firebase.
