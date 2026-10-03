# Rayons solaires au scroll

4 octobre 2026.

Remplacer la texture statique par une illusion volumétrique solaire synchronisée à la séquence Torii. Préserver le contenu, les volets et la lisibilité. Pas de ray tracing physique ni de nouvelle dépendance.

## Étapes

- Dessiner des faisceaux doux en perspective dans un canvas de faible définition, avec masque de luminosité issu de la frame visible pour atténuer la lumière sur les arbres.
- Réutiliser la boucle de rendu existante et la frame effectivement affichée ; aucun timer ni état React au scroll. Arrêt au repos/onglet masqué, effet absent en réduction des mouvements.
- Contrôler TypeScript, export statique, téléphone/tablette/PC, clavier, réduction des mouvements et coût indicatif de rendu.
- Actualiser la documentation et conserver les textures originales comme assets historiques.

## Validation

TypeScript et build/export de production isolé validés : 11 pages, /noces 8,04 kB et 102 kB de premier chargement JS. Chrome headless sous /wedding/, DPR 2 : 320×568, 820×1180, 1440×900 et 844×390 ; scroll avant/arrière (rendu identique au retour), resize/orientation, absence de débordement et d’erreur JS, volets au clavier, changements à chaud de préférence et fallback sans JavaScript contrôlés. Réduction des mouvements dès le chargement : une seule URL de frame et aucun rayon. Zéro callback rAF/dessin au repos dans les fenêtres de contrôle. Aucune requête de texture.

Mesure indicative à 390×844, CPU ×4, même progression sur les premiers 15 % de la séquence : coût CPU des callbacks rAF au p95 4.5 → 7.3 ms ; traitement solaire seul au p95 5.6 ms. Comparaison avec l’export historique noces-drawer-validation (même séquence et renderer avant rayons) ; textures/voile de cette ancienne capture peuvent différer. Mesure ponctuelle locale, pas une mesure de FPS ni une garantie sur téléphone physique/réseau lent ; tâches longues et dispersion sont conservées dans le rapport brut. Les coûts de décodage vidéo et composition GPU ne sont pas entièrement représentés par le temps des callbacks. [Captures et rapports](../../screenshots/README.md). Aucun appel/écriture Firebase, RSVP soumis ou déploiement.

Travail terminé ; masque 128px sur mobile/160px ailleurs et courbe de transmission précalculée pour réduire le coût CPU.
