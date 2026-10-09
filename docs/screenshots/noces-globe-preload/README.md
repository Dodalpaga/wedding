# Globe préparé avant le scroll

Le dossier porte désormais le nom Noces. Les URLs de l'ancienne route du prototype dans les rapports ci-dessous restent historiques ; la route actuelle est `/noces/`.

Contrôle historique de la cartographie seule. Depuis le 9 octobre, l'écran prépare également les trois modèles GLB et leur rendu, y compris en réduction des mouvements. Voir les [contrôles du parcours actuel](../noces-experiences/README.md).

Vérification du 8 octobre 2026 sur l'export `/wedding/motiontemplate/`, Chrome Windows, GPU NVIDIA GTX 1070 via ANGLE/D3D11. Cache HTTP désactivé par CDP avant chaque visite ; aucune interception des requêtes CARTO, aucune écriture Firebase. Script local `build/check-globe-preload.cjs` et copie de compilation `build/motion-validation` (ignorés par Git).

## Résultats

[report.json](report.json) : chargement initial, parcours progressif Toulouse → Tokyo, retour, sauts rapides et contrôle des requêtes CARTO. **Zéro requête cartographique pendant le scroll** dans les trois formats :

| Viewport | Tuiles de la couverture | Vues de préparation | Temps initial observé |
| --- | --- | --- | --- |
| 320×568 | 176 | 23 | 10,4 s |
| 820×1180 | 321 | 24 | 14,2 s |
| 1440×900 | 350 | 31 | 15,0 s |

Ces temps incluent la navigation, le chargement initial et la préparation. Mesures ponctuelles sans limitation de débit ; aucun délai garanti. Le nombre de tuiles concerne la couverture calculée avec marge, pas la taille totale de la mémoire.

Après redimensionnement 320×568 → 390×844 : nouvel écran de préparation, puis zéro requête CARTO sur le nouveau parcours avant/arrière. Les tuiles déjà chargées restent réutilisables. Défilement bloqué pendant la préparation, puis libéré. Aucun débordement horizontal ou erreur JavaScript dans les visites normales. Le lien de passage fonctionne au clavier.

Réduction des mouvements dès l'ouverture : zéro requête CARTO et aucun écran de préparation. Changement à chaud contrôlé après préparation. Sans JavaScript : résumé accessible et aucun écran bloquant. Échec simulé du style : message explicite, bouton Réessayer, possibilité de passer le voyage avec défilement libéré.

[final-report.json](final-report.json) : parcours complet, nuages inclus, sur 390×844/DPR 2 et sur le serveur Next en développement à 320×568. Zéro requête CARTO après préparation, maquette WebGL prête et aucune erreur JavaScript. Accès Tab vers le lien visible de préparation, sans focus sur les commandes de carte masquées derrière l'écran ; les éléments du globe sont temporairement inert.

## Captures

- [320-loading.png](320-loading.png), [820-loading.png](820-loading.png), [1440-loading.png](1440-loading.png) : préparation avec progression.
- [320-ready.png](320-ready.png), [820-ready.png](820-ready.png), [1440-ready.png](1440-ready.png) : ouverture sur Toulouse préparée.
- [320-arrival.png](320-arrival.png), [820-arrival.png](820-arrival.png), [1440-arrival.png](1440-arrival.png) : Tokyo au même zoom.
- [320-error.png](320-error.png) : repli en cas d'échec de chargement.

## Limites et historique

Une première passe, avant réduction des vues redondantes, a utilisé SwiftShader : [smoke-report.json](smoke-report.json), zéro requête au scroll, 51 vues et environ 176 s de préparation sur 320×568. Le matériel et la stratégie diffèrent du rapport courant ; ces temps ne mesurent pas isolément le gain de l'optimisation. Le rendu logiciel peut être beaucoup plus lent.

Pas d'essai sur téléphone physique, connexion lente ou avec la barre d'adresse mobile pendant un geste. La cartographie nécessite une connexion durant la préparation ; une erreur empêche la libération automatique d'une carte incomplète. L'étendue est celle du trajet et du viewport préparés, avec 256px de marge sur chaque côté ; il ne s'agit pas de télécharger toute la planète à tous les niveaux de détail. Les caches sont propres à la visite, plafonnés à 2048 tuiles par source et libérés avec la carte.

Aucun accès/écriture Firebase, RSVP soumis ou déploiement.
