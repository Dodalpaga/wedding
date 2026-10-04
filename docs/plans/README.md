# Plans d’exécution

Plan actif : [Noces : GSAP et images originales](active/noces-gsap-native-quality.md).

Pour un changement complexe ou un refactoring majeur : créer un document dans `active/`, décrire le but et les étapes, noter les validations puis déplacer le plan dans `completed/` à la fin. Les plans terminés sont un historique ; la référence actuelle est [ARCHITECTURE.md](../ARCHITECTURE.md) et [PROJECT_STATE.md](../PROJECT_STATE.md).

| Plan terminé | Portée et actualité |
| --- | --- |
| [noces-reversal-freeze.md](completed/noces-reversal-freeze.md) | Correction du blocage à l’inversion ; tests avant/après et traversées rapides Chrome Windows PC. |
| [noces-decoder-priority.md](completed/noces-decoder-priority.md) | Voie urgente, cache réduit ; gain de mémoire et de suivi, freezes encore présents. |
| [noces-last-stutters.md](completed/noces-last-stutters.md) | Mise à jour GSAP directe et préparation des photos mobiles ; améliorations mesurées et pauses résiduelles documentées. |
| [mobile-landing.md](completed/mobile-landing.md) | Premier refactoring : disclosures et accès rapide. Le hero court/fond statique ont depuis été remplacés. |
| [desktop-tablet-layout.md](completed/desktop-tablet-layout.md) | Panneaux alignés et RSVP compact. Le hero mobile court est ensuite remplacé par le plein écran. |
| [honeymoon-page.md](completed/honeymoon-page.md) | V1 historique : carnet d’un mois ; hero et placeholders remplacés en V2. |
| [noces-v2.md](completed/noces-v2.md) | Première V2 historique ; navbar/menu, timeline et chargement PNG remplacés. |
| [noces-hero-performance.md](completed/noces-hero-performance.md) | Historique : hero unique, défilement naturel des étapes et optimisation WebP/rendu. |
| [noces-fade-scenes.md](completed/noces-fade-scenes.md) | État courant : Torii 597 frames, scènes fixes en fondu, cartes photo et cadeau final avec retour Accueil. |
| [noces-cinematic-drawers.md](completed/noces-cinematic-drawers.md) | Hero élargi, carte inversée et volets natifs. Voile bleu et commande à plusieurs lignes remplacés. |
| [noces-shadow-textures.md](completed/noces-shadow-textures.md) | Ombre gris foncé diagonale et panneau mobile ; textures remplacées par les rayons solaires. |
| [noces-performance-final.md](completed/noces-performance-final.md) | Première borne LRU ; budgets et scheduler remplacés par le buffer réseau ci-dessous. |
| [noces-network-buffer.md](completed/noces-network-buffer.md) | Téléchargement/décodage indépendants, anticipation réseau, budgets adaptatifs et mesures sous latence. |
| [noces-solar-rays.md](completed/noces-solar-rays.md) | Rayons solaires au scroll, perspective, masque de luminance et performances bornées. |
| [documentation-sync.md](completed/documentation-sync.md) | Audit et consolidation complète de la documentation. |
| [admin-csv-layout.md](completed/admin-csv-layout.md) | CSV multiline, palette admin, pagination et cartes responsive. |

Le plan GSAP reste ouvert pour l’objectif absolu de fluidité à toute vitesse.
