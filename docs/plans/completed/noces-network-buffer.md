# Buffer réseau du voyage

4 octobre 2026. Corriger les pauses observées sur GitHub Pages en conservant le design, les 597 frames natives et le moteur solaire.

- Séparer téléchargements compressés et décodages ; donner la priorité à l’image courante et anticiper le sens/la vitesse du scroll ainsi que la latence observée.
- Agrandir les buffers dans des limites mémoire explicites ; préchargement complet compressé sur PC, fenêtre mobile bornée, respect des connexions économes et appareils à faible mémoire.
- Pause en onglet masqué, première frame seule en réduction des mouvements, libération des bitmaps et annulation/nettoyage des opérations obsolètes.
- Tester le scheduler avec des tâches contrôlées, puis comparer avant/après avec réseau retardé et exercer le parcours avec CPU ralenti. Vérifier responsive, dev/Strict Mode, repos et pixels.
- TypeScript, export isolé et documentation actualisée. Aucun déploiement ni appel Firebase.

Terminé : TypeScript, huit tests scheduler/cache et export isolé (11 pages) validés. Comparaison réseau 150 ms/frame, 20 Mbit/s : p95 d’écart cible/image 13→3 frames sur téléphone, 12→3 sur PC ; davantage de données anticipées. Responsive, retour identique, clavier, réduction des mouvements, no-JS et zéro rendu au repos validés. Voir [méthode et rapports](../../screenshots/noces-network-buffer/README.md). Pas de garantie sur réseau réel/appareil physique. Design solaire inchangé, aucun appel Firebase ni déploiement.
