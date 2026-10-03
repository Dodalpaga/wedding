# Dernière passe performances du voyage

4 octobre 2026. Conserver exactement le design, l’intensité des rayons et la cadence de la séquence.

- Mesurer le rendu actuel sur téléphone/tablette/PC et avec CPU ralenti.
- Évaluer les opérations canvas et les calculs invariants des faisceaux ; conserver le renderer original en l’absence de gain CPU fiable.
- Borner le cache de blobs compressés, actuellement cumulatif, sans modifier les fichiers source ni le cache de bitmaps.
- Vérifier les parcours, le mode dev, la réduction des mouvements et le repos ; TypeScript et export isolé.
- Documenter les mesures, leurs limites et les compromis de cache.

TypeScript, les trois tests du cache (LRU, remplacement/clear, parcours complet) et export isolé validés : 11 pages, /noces 8,29 kB et 102 kB de premier chargement JS. Simulation avec les tailles réelles des 597 frames : rétention compressée auparavant potentiellement 72,55 Mio, désormais ≤12/24 Mio. Ce budget concerne les blobs conservés, pas toute la mémoire du navigateur (bitmaps, canvas et requêtes en cours restent distincts). Le moteur solaire est conservé strictement à l’identique, vérifié par SHA-256 ; aucune couleur, largeur, luminosité, résolution, cadence, frame ou disposition modifiée.

Chrome headless sous /wedding/ : 320×568, 820×1180, 1440×900 et 844×390/DPR 2 ; scroll avant/arrière, resize, clavier/volets, réduction des mouvements à chaud et dès le chargement (une URL de frame), no-JS, zéro dessin/callback au repos et absence d’erreurs/débordements contrôlés. Vérification complémentaire sur le serveur de développement avec Strict Mode.

Essai ponctuel 390×844/CPU ×4 sur les premiers 15 % de la séquence : callbacks rAF au p95 7.5 → 7.5 ms ; traitement solaire 10.1 → 5.7 ms. Les variations de décodage/ordonnancement sont conservées dans le rapport ; pas de gain CPU/FPS fiable revendiqué. L’optimisation retenue est la rétention mémoire bornée. Un retour lointain peut nécessiter de nouvelles lectures/requêtes, selon le cache HTTP. Aucun essai sur téléphone physique/réseau lent ni déploiement ; aucune donnée Firebase lue/écrite. [Rapports](../../screenshots/README.md).

Terminé.
