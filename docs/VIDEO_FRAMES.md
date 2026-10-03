# Extraire toutes les frames d’une vidéo sous Windows

FFmpeg peut exporter une image WebP par frame décodée. Utiliser `-fps_mode passthrough`, sans filtre `fps` ni option `-r`, pour ne pas ajouter ou supprimer des frames. Références : [FFmpeg](https://ffmpeg.org/ffmpeg.html) et [binaires Windows](https://ffmpeg.org/download.html).

## Script du projet

Depuis la racine du projet, dans PowerShell :

```powershell
.\scripts\extract-video-frames.ps1
```

Par défaut : `public/assets/Torii_better_fps.mp4` → `public/assets/torii-better-fps-frames/`. Le script refuse tout dossier de sortie non vide, vérifie le nombre de frames décodées avec ffprobe, la numérotation continue et l’intégrité SHA-256 du MP4. Il n’écrit jamais dans le fichier source. Le manifeste `sequence.json` conserve le nombre, le pattern, le padding, la cadence, les dimensions et les paramètres de qualité.

Pour une nouvelle extraction, choisir un dossier vide :

```powershell
.\scripts\extract-video-frames.ps1 `
  -InputVideo '.\public\assets\Torii_better_fps.mp4' `
  -OutputDirectory '.\public\assets\new-frames' `
  -Quality 85
```

Les WebP sont en qualité 85 par défaut (compression avec perte), à la résolution d’origine, sans crop et sans changement de cadence. Pour un WebP sans perte après décodage de la vidéo, utiliser `-Lossless` et un autre dossier de sortie ; cela produit des fichiers plus volumineux.

## FFmpeg portable

Le script utilise `ffmpeg`/`ffprobe` dans PATH, ou les exécutables portables dans `build/tools/ffmpeg/bin/` (ignorés par Git). La version locale 9.0.2 a été téléchargée depuis Gyan, fournisseur lié par ffmpeg.org ; l’archive a été vérifiée avec le SHA-256 publié. Aucun changement de PATH ni installation système n’est nécessaire pour le script dans ce checkout.

Sur une autre machine, récupérer un [build Windows](https://www.gyan.dev/ffmpeg/builds/) contenant les deux exécutables. Fournir leurs chemins si nécessaire :

```powershell
.\scripts\extract-video-frames.ps1 `
  -FFmpegPath 'C:\ffmpeg\bin\ffmpeg.exe' `
  -FFprobePath 'C:\ffmpeg\bin\ffprobe.exe' `
  -OutputDirectory '.\public\assets\new-frames'
```

Équivalent CLI pour un dossier `frames` préalablement créé :

```powershell
ffmpeg -n -i '.\public\assets\Torii_better_fps.mp4' -map 0:v:0 -an -sn -dn -fps_mode passthrough -c:v libwebp -q:v 85 -compression_level 4 -start_number 1 -f image2 'frames\frame-%06d.webp'
```

## Séquence extraite

La vidéo `Torii_better_fps.mp4` contient 597 frames décodées, à 120 fps, en 1280 × 720, pour 4,975 secondes. La séquence active du hero utilise désormais `frame-000001.webp` à `frame-000597.webp`, avec padding 6, configurée dans `components/noces/frame-sequence.ts`. Une extraction ultérieure reste indépendante : modifier cette constante pour activer une autre séquence.

Extraction terminée et contrôlée : 597 WebP statiques valides à 1280 × 720, numérotés sans trou, total 76 075 062 octets (72,55 Mio). Compression WebP qualité 85. Le nombre correspond aux 597 frames décodées par ffprobe ; le SHA-256 du MP4 est identique avant/après extraction. Les frames ne sont ni redimensionnées ni recadrées.

## Photos des cartes d’escales

Photos enregistrées localement en WebP, largeur 1600px, qualité 82, sans service externe au rendu. La carte les affiche en cover ; la séquence vidéo reste intacte. Chaque photo est proposée sous [licence Unsplash](https://unsplash.com/license) sur sa page source. Les remplacer dans `tripSteps.image` ; sans champ image, le placeholder de marque réapparaît.

| Fichier sous `public/images/noces/` | Sujet et source |
| --- | --- |
| `tokyo.webp` | Shinjuku de nuit, [mos design](https://unsplash.com/photos/a-busy-street-in-tokyo-at-night-13hAeb_-Yts). |
| `hakone.webp` | Lac Ashi, torii et Fuji, [Alessandro Pacilio](https://unsplash.com/photos/red-pagoda-temple-on-body-of-water-dZdYGdDrdfM). |
| `kyoto.webp` | Kiyomizu-dera, [David Emrich](https://unsplash.com/photos/red-temple-near-trees-f6hlrIboDUY). |
| `osaka.webp` | Restaurants le long de Dōtonbori le soir, [Stefan Szankowski](https://unsplash.com/photos/dotonbori-canal-night-street-scene-uJMxwOMXhwM). |
| `ishigaki.webp` | Baie de Kabira, [Christoph Schmid](https://unsplash.com/photos/three-boat-on-body-of-water-fGaytFZb7WM). |
