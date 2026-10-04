# Noces : freeze à l'inversion du scroll

4 octobre 2026. L'utilisateur précise Chrome sur PC Windows, aller-retour rapides entre le début et la fin du parcours.

Défaut reproduit par un test avant correction : image affichée 2, position demandée 8 puis inversion vers 7 ; le buffer conservait 2 alors que 7 était déjà disponible. La borne monotone de l'ancien mouvement n'était pas remise à zéro lors d'une inversion courte. La caméra devait repasser sur l'ancienne image avant que le fond bouge. Le cas symétrique existe vers l'avant.

Correction : réinitialiser la sélection de présentation à chaque changement de direction, puis reprendre la progression monotone après le premier dessin. Conserver l'image précédente si aucune image éligible n'est prête. Sources, qualité, cache, rayons, GSAP et photos inchangés.

Validation réalisée : 22 tests, dont les régressions dans les deux sens (premier test échoué avant correction, passé après), TypeScript et export isolé de 11 pages. Chrome Windows PC, trois traversées rapides avant/arrière de 24 pas avec blobs prêts des deux côtés, clavier/resize/réduction des mouvements/no-JS : assertions passent. Référence avant correction : `build/noces-reversal-baseline/out`. [Mesures et limites](../../screenshots/noces-reversal-freeze/README.md).

Le recalage initial peut être visible si l'image était très en retard ; deux occurrences sont distinguées explicitement dans la passe finale. La progression suivante reste monotone. La vérification n'établit pas une disparition de toutes les pauses de décodage/composition ; l'objectif absolu reste ouvert dans le plan GSAP. Aucun accès Firebase ni déploiement.
