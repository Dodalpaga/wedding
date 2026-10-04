# Noces : priorité de décodage et mémoire

4 octobre 2026. Retour utilisateur après la passe précédente : mieux, mais petits freezes persistants. Hypothèse à vérifier : décodages spéculatifs monopolisant tous les emplacements et trop de bitmaps conservés en parallèle des photos des scènes.

Référence isolée avant modification : `build/noces-freeze-baseline/out`. Essai : cache 16/24 images au lieu de 24/40, anticipation de décodage 9/15 au lieu de 17/29 ; quatre décodages maximum mais une voie réservée à la position actuelle. Sources, densité temporelle, canvas et rayons inchangés. Ni nouvelle compression ni baisse de résolution.

Validation réalisée : test ciblé de la voie urgente ; 20 tests ciblés et TypeScript passent ; export isolé de 11 pages. Comparaison avant/après avec trois répétitions sur téléphone/tablette/PC, réseau froid, réduction des mouvements, clavier/no-JS/resize et arrêt des dessins au repos : assertions validées. [Mesures et limites](../../screenshots/noces-decoder-priority/README.md).

Réglages retenus pour le gain de mémoire (33 % mobile, 40 % PC dans le cache RGBA) et la réduction de l'écart d'images dans les traversées rapides. Les tâches longues restent présentes avec un nombre similaire : cette passe ne résout pas tous les freezes et ne démontre pas une fluidité parfaite. L'appareil/navigateur a été demandé à l'utilisateur pour cibler la suite. Aucun accès Firebase ni déploiement.
