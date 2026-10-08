# Modèles Motiontemplate

Trois GLB fournis par les propriétaires le 9 octobre 2026, en remplacement des paysages précédents. Le globe, l'avion et les nuages restent en place. [Plan](plans/active/motiontemplate-three-experiences.md).

| Modèle | Fichier source | Crédits présents dans le GLB |
| --- | --- | --- |
| [Littlest Tokyo](https://sketchfab.com/3d-models/littlest-tokyo-30c4a731fb8f4981bb9fdf0cfd986b70) | `public/assets/models/littlest_tokyo.glb`, 13 932 048 octets | Métadonnées : 3D Models Low Poly, CC BY 4.0. Création originale créditée à Glen Fox par [l'exemple officiel Three.js](https://threejs.org/examples/webgl_animation_keyframes.html). |
| [Japanese Restaurant Inakaya](https://sketchfab.com/3d-models/japanese-restaurant-inakaya-97594e92c418491ab7f032ed2abbf596) | `public/assets/models/japanese_restaurant_inakaya.glb`, 20 465 048 octets | Jellepostma, CC BY 4.0. |
| [InuBeko Ukiyo — Kinkakuji Temple](https://sketchfab.com/3d-models/inubeko-ukiyo-kinkakuji-temple-3d146476840847ca9d46f3300aa4445d) | `public/assets/models/inubeko_ukiyo_-_kinkakuji_temple.glb`, 23 361 228 octets | Jellepostma, CC BY 4.0. |

Les fichiers sont autonomes et leurs textures sont embarquées. Littlest Tokyo contient l'animation `Take 001` de dix secondes, 107 canaux, échantillonnée selon le scroll dans les deux sens. Inakaya ne contient pas de caméra/animation : le parcours est créé dans `experience-state.ts`. Après la vue extérieure, la caméra passe au centre de la porte (x = 0,75), sous le rideau (y = 1,1), avant de remonter légèrement à l'intérieur. Deux vues larges montrent le comptoir, les plats et les outils ; les gros plans des annotations Sketchfab ne sont pas utilisés. Le retour retraverse la même entrée, puis retrouve le cadrage extérieur initial.

Le temple conserve ses matériaux unlit et son style illustré. Le pointeur et les flèches du clavier font tourner le groupe 3D contenant le cube et ses plans internes, autour de son centre. La caméra et le cadre papier restent fixes. Quitter la carte, perdre le focus ou appuyer sur Échap/Home réinitialise la rotation. Sur tactile, la carte reste fixe ; la réduction des mouvements désactive sa rotation et l'animation du train.

Tokyo monte progressivement derrière le globe et les nuages, sans seuil de visibilité, fondu ou agrandissement. Tokyo et Inakaya utilisent une lumière directionnelle avec ombres portées et une passe d'occlusion ambiante SSAO. L'environnement et la lumière ambiante sont réduits pour conserver les contrastes. Le temple garde son rendu d'origine sans ces effets.

Les versions web sont générées séparément par `node scripts/prepare-motion-models.mjs`, avec Meshopt et des textures WebP. Un argument `tokyo`, `restaurant` ou `temple` permet de ne préparer qu'un modèle. Les sources restent intactes ; `public/assets/models/motion-models.json` conserve leurs empreintes, les crédits et les tailles générées.

| Variante | Tokyo | Inakaya | Kinkakuji | Total |
| --- | ---: | ---: | ---: | ---: |
| PC/tablette | 4 166 880 | 4 128 652 | 2 935 340 | 11 230 872 octets |
| Téléphone | 3 752 728 | 2 884 224 | 2 935 340 | 9 572 292 octets |

Les textures sont plafonnées à 2048px sur PC/tablette et 1024px sur téléphone, sauf la couleur d'Inakaya (4096/2048px) pour préserver les détails. Le profil est choisi au chargement et conservé lors des redimensionnements. Les textures sont envoyées au GPU, les programmes compilés et les vues, ombres et passes de post-traitement rendues derrière l'écran de préparation avant de libérer le scroll. Aucun dessin des modèles n'est effectué au repos ou dans un onglet masqué ; ressources et contextes retirés sont libérés au démontage. Three.js et les outils de préparation sont gratuits. Les crédits et liens de licence sont affichés en fin de page.
