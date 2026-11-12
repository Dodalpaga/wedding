# Modèles Noces

Les transitions de `/noces/` utilisent trois modèles Sketchfab sous licence CC BY 4.0. Les crédits sont affichés sur chaque transition et conservés dans les métadonnées des fichiers.

| Modèle | Auteur | Version web (`public/assets/models/noces/`) |
| --- | --- | ---: |
| [N700-3000 Series Shinkansen](https://sketchfab.com/3d-models/n700-3000-series-shinkansen-f70820be44e0467d8b1614f2aa3045bd) | Layo | `shinkansen.glb`, ~130 Ko |
| [Torii Gate](https://sketchfab.com/3d-models/torii-gate-bcad7f0d07984d6b8d5d1f63c7949d84) | panrichi | `torii.glb`, ~1,5 Mo |
| [Japanese Stone Lantern](https://sketchfab.com/3d-models/japanese-stone-lantern-e0417d1e05984727a50f9ab1451d162d) | Sahir Virmani | `lanterne.glb`, ~0,4 Mo |

## Sources et préparation

Les sources (`n700-3000_series_shinkansen.glb`, `torii_gate.glb`, `japanese_stone_lantern.glb`, téléchargées depuis Sketchfab au format GLB) vont dans `assets/models/noces/`. Ce dossier est **exclu de Git** (`.gitignore`) car les fichiers sont lourds (jusqu'à 27 Mo) ; il faut les conserver à part pour pouvoir régénérer les versions web.

`node scripts/prepare-noces-models.mjs [shinkansen|torii|lanterne]` produit les versions web (géométrie Meshopt, textures WebP) et met à jour `assets/models/noces-models.json` (empreintes SHA-256, tailles et crédits des sources).

- **Shinkansen** : seule la motrice avant est conservée (nœuds dont le centre est à x ≤ 0,4 dans le modèle source, nez vers les x négatifs), puis simplifiée. La page la duplique dos à dos pour former une rame courte avec un nez à chaque extrémité. Le modèle n'a pas de texture.
- **Torii** : textures limitées à 1024 px. La page mesure sur le modèle, par lancer de rayons, l'ouverture entre les piliers et la traverse basse pour découper la vue d'Osaka.
- **Lanterne** : modélisée en centimètres, remise à l'échelle dans la page ; textures limitées à 512 px.

## Rendu

Canvas WebGL transparent superposé aux fonds de page, éclairage d'environnement (`RoomEnvironment`), lumière directionnelle avec ombres projetées sur un plan invisible (`ShadowMaterial`). Three.js et les modèles ne sont chargés qu'à l'approche de chaque transition ; le rendu n'a lieu que pendant le scroll et s'arrête hors écran. Ressources et contextes sont libérés au démontage.

Les sources de signatures SVG/HTML sont conservées dans `assets/signatures/` ; la signature affichée par le site reste dans `components/Signature.tsx`.

## Photo du lagon

Le fond marin d'Okinawa (`public/images/noces/okinawa-recif.webp`, 1920 × 1280, WebP qualité 78) vient de la photo Pexels 35269346, « Clear Ocean Water with Coral Reefs », de Jeffry Surianto ([source](https://www.pexels.com/photo/clear-ocean-water-with-coral-reefs-35269346/), licence Pexels). Le crédit est affiché en bas de la section.
