# Noces : pauses résiduelles après GSAP

4 octobre 2026. Retour utilisateur : nette amélioration, satisfaction estimée à 85 %, quelques pauses persistent. Conserver la qualité des images et mesurer les améliorations de cette version avant de changer de bibliothèque.

- Stash précédent supprimé à la demande explicite de l'utilisateur (`32965b7`). La version GSAP courante reste dans le working tree.
- Les traces de la passe précédente montrent des décodages LazyPixelRef longs lors de l'apparition des photos d'escales. Vérifier leur préparation avant les transitions, sans re-compression ni résolution réduite.
- ScrollTrigger synchronise déjà les mises à jour au raf : supprimer le second raf dans ses callbacks de progression du décor et des scènes. Conserver la planification pour les notifications asynchrones du décodeur et les mesures de taille.
- Export de référence isolé : `build/noces-85-baseline/out`, copie de la version GSAP courante avant cette passe ; assets originaux partagés par junctions. Aucun build concurrent dans le `.next` du serveur utilisateur.

Réalisé : comparaison avant/après sur trois formats avec trois répétitions, réseau froid, clavier/ancres/volets, réduction des mouvements initiale et dynamique, no-JS, resize court et arrêt des dessins au repos. 19 tests ciblés, TypeScript et export statique (11 pages) passent. [Mesures et limites](../../screenshots/noces-last-stutters/README.md).

Retenu : callback de progression direct sur tous les profils ; préparation séquentielle des photos originales uniquement sur mobile/tactile. L'essai de préparation des photos sur PC est remplacé par le chargement natif après comparaison mitigée. La passe PC finale conserve uniquement le callback direct ; sa première traversée rapide passe de 42 à 50 dessins et de 209 à 35 ms pour le plus grand intervalle mesuré. Ces valeurs ponctuelles ne garantissent pas l'absence de pauses lors des répétitions.

Limites : les premières traversées rapides sont améliorées, mais des tâches longues persistent dans les répétitions ; le réseau froid reste limitant. Pas de garantie zéro lag, ni mesure sur appareil physique/Safari/écran 120 Hz. Les fichiers photographiques et pixels source sont inchangés. La préparation des photos utilise de la mémoire de décodage gérée par le navigateur, distincte du cache borné de la séquence. Aucun appel Firebase ni déploiement.
