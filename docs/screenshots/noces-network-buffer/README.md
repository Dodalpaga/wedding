# Buffer réseau — 4 octobre 2026

[Réseau avant/après](runtime.json), [parcours responsive et CPU ralenti](ui.json), [PC après modification](desktop.png).

Chrome headless, cache désactivé. Export antérieur avec téléchargements/décodages couplés et cache compressé 12/24 Mio comparé au nouveau scheduler. Chaque réponse de frame attend 150 ms ; débit Chrome limité à 20 Mbit/s. Scroll commencé 2,5 s après affichage du canvas, 121 positions de 0→120 puis 120→60, attente 33 ms entre positions et 1 s entre phases. Frames indexées à partir de zéro ; écart mesuré entre position cible et image réellement dessinée, incluant l’easing. Un changement visible est un dessin vidéo, pas un FPS écran.

Résultat de ce passage : 47→117 changements sur téléphone, 67→117 sur PC en progression ; écart p95 13→3 et 12→3 frames. Davantage de données reçues avant usage ; connexion plus lente ou saut très lointain peuvent encore attendre. Les échantillons varient avec l’ordonnancement du navigateur. Pas de mesure sur téléphone physique ni de benchmark du CDN réel.

UI : DPR 2, téléphone 320×568, tablette 820×1180, PC 1440×900, paysage 844×390. Rayons réversibles, resize, clavier, réduction des mouvements, poster sans JavaScript, aucun débordement/erreur, aucun dessin/callback au repos. Le passage 320px parcourt aussi la séquence avec CPU ×4 ; les tâches longues restent dans le JSON. Aucun appel Firebase ni déploiement.
