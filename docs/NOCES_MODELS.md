# Modèles Noces

La scène sticky conserve `100lvh` (fallback `100vh`) pour couvrir la zone libérée lorsque la barre d'adresse mobile se replie, y compris pendant le geste. La longueur du parcours reste en `svh`. La première tranche du parcours est une hero éditoriale sur fond neutre ; le globe entre depuis le bas après environ un écran de scroll, et le progrès des expériences démarre une fois cette transition terminée. Les translations d'Inakaya sont exprimées en pourcentage de sa hauteur, comme celle du globe. La vidéo remplace l'interlude vide. La scène Inakaya se termine plus tôt, sans retour extérieur : la caméra garde un cadrage intérieur et le carrousel enchaîne après une transition raccourcie. Le calcul du progrès soustrait la hauteur réelle de la scène. La réduction des mouvements conserve son contenu dans le flux avec une hauteur naturelle.

Deux modèles autonomes avec textures embarquées. Les sources originales restent dans assets/models/, hors export du site.

Le cadrage du globe compense le facteur de latitude de MapLibre : son échelle apparente reste constante pendant le vol vers le nord, sans agrandissement au milieu du trajet. Le recul est réduit (rayon de référence de 1,8 × la petite dimension du viewport / 2π), avec un dézoom au départ et un zoom à l'arrivée. Après la hero neutre, le globe est immobile jusqu'à la disparition du titre de cette section, puis le voyage reprend jusqu'au même point de sortie sous les nuages. La carte emploie une palette plus contrastée inspirée de l'illustration de voyage japonaise : océan jade, terres crème, parcs sauge, frontières encre, halos de texte et trajectoire cuivre lumineuse. Les vues de la France et du Japon entiers conservent leurs cadrages.

| Modèle | Fichier source | Crédits présents dans le GLB |
| --- | --- | --- |
| [Japanese Restaurant Inakaya](https://sketchfab.com/3d-models/japanese-restaurant-inakaya-97594e92c418491ab7f032ed2abbf596) | `assets/models/japanese_restaurant_inakaya.glb`, 20 465 048 octets | Jellepostma, CC BY 4.0. |
| [InuBeko Ukiyo — Kinkakuji Temple](https://sketchfab.com/3d-models/inubeko-ukiyo-kinkakuji-temple-3d146476840847ca9d46f3300aa4445d) | `assets/models/inubeko_ukiyo_-_kinkakuji_temple.glb`, 23 361 228 octets | Jellepostma, CC BY 4.0. |

Les fichiers sont autonomes et leurs textures sont embarquées. Inakaya ne contient pas de caméra/animation : le parcours est créé dans `experience-state.ts`. La caméra démarre plus près, au cadrage correspondant à 10 % de l'ancien trajet ; elle passe au centre de la porte (x = 0,75), sous le rideau (y = 1,1), avant de remonter légèrement à l'intérieur. Deux vues larges montrent le comptoir, les plats et les outils ; les gros plans des annotations Sketchfab ne sont pas utilisés. La caméra termine sur un cadrage intérieur et ne ressort plus du restaurant.

Le temple conserve ses matériaux unlit et son style illustré. Le pointeur, les flèches du clavier et l'inclinaison du téléphone font tourner le groupe 3D contenant le cube et ses plans internes, autour de son centre. La caméra et le cadre papier restent fixes. Sur PC, quitter la carte ou perdre le focus réinitialise la rotation ; Échap/Home et le bouton « Recentrer » définissent la position actuelle comme nouveau neutre sur téléphone. La réduction des mouvements désactive la rotation de la carte.

`usePostcardTilt.ts` capture la première orientation valide dès le montage (même pendant la préparation du voyage), puis applique une rotation relative à cette position via `postcard-tilt.ts`. Le mouvement est lissé, borné à la même amplitude que le survol PC et adapté à l'orientation de l'écran. Les capteurs restent écoutés hors écran pour conserver la référence initiale, mais aucun dessin n'est demandé lorsque la carte est hors écran ou l'onglet masqué. Une position stable arrête le lissage ; les petites variations des capteurs sont filtrées. Le changement portrait/paysage recapture une référence neutre.

Sur les navigateurs imposant [une autorisation déclenchée par un geste](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static), le bouton « Activer l'inclinaison » demande l'accès ; la première mesure après autorisation devient le neutre, car le navigateur interdit les mesures avant ce geste. En cas de refus, d'absence de capteurs ou de contexte non sécurisé, un message garde la carte consultable. Les orientations ne sont ni stockées ni transmises.

Inakaya utilise une lumière directionnelle avec ombres portées et une passe d'occlusion ambiante SSAO. L'environnement et la lumière ambiante sont réduits pour conserver les contrastes. Le temple garde son rendu d'origine sans ces effets.

Les versions web sont générées séparément par `node scripts/prepare-noces-models.mjs`, avec Meshopt et des textures WebP. Un argument `restaurant` ou `temple` permet de ne préparer qu'un modèle. Les sources et variantes web de Little Tokyo ont été supprimées ; `assets/models/noces-models.json` conserve les empreintes, crédits et tailles des modèles restants.

| Variante | Inakaya | Kinkakuji | Total |
| --- | ---: | ---: | ---: |
| PC/tablette | 4 128 652 | 2 935 340 | 7 063 992 octets |
| Téléphone | 2 884 224 | 2 935 340 | 5 819 564 octets |

Les textures sont plafonnées à 2048px sur PC/tablette et 1024px sur téléphone, sauf la couleur d'Inakaya (4096/2048px) pour préserver les détails. Le profil est choisi au chargement et conservé lors des redimensionnements. Les textures sont envoyées au GPU, les programmes compilés et les vues, ombres et passes de post-traitement rendues derrière l'écran de préparation avant de libérer le scroll. Aucun dessin des modèles n'est effectué au repos ou dans un onglet masqué ; ressources et contextes retirés sont libérés au démontage. Three.js et les outils de préparation sont gratuits. Les crédits et liens de licence des deux modèles sont affichés en fin de page.

Le temple utilise une seule variante publique temple.glb, identique pour téléphone et PC. Les sources de signatures SVG/HTML sont conservées dans assets/signatures/ ; la signature affichée par le site reste dans components/Signature.tsx.
