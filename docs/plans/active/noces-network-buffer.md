# Buffer réseau du voyage

4 octobre 2026. Corriger les pauses observées sur GitHub Pages en conservant le design, les 597 frames natives et le moteur solaire.

- Séparer téléchargements compressés et décodages ; donner la priorité à l’image courante et anticiper le sens/la vitesse du scroll ainsi que la latence observée.
- Agrandir les buffers dans des limites mémoire explicites ; préchargement complet compressé sur PC, fenêtre mobile bornée, respect des connexions économes et appareils à faible mémoire.
- Pause en onglet masqué, première frame seule en réduction des mouvements, libération des bitmaps et annulation/nettoyage des opérations obsolètes.
- Tester le scheduler avec des tâches contrôlées, puis comparer avant/après avec réseau retardé et CPU ralenti. Vérifier responsive, dev/Strict Mode, repos et pixels.
- TypeScript, export isolé et documentation actualisée. Aucun déploiement ni appel Firebase.

Validation en cours.
