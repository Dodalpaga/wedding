# Décisions

Référence actuelle : 4 octobre 2026. Ce fichier distingue les choix en vigueur des propositions remplacées pendant les ajustements visuels.

## Choix en vigueur

### Flags d’invitation dans Firestore — 5 octobre 2026

`participation_repas` et `couchage_sur_place` décrivent tout le groupe. La confirmation utilise un `false` explicite pour afficher le badge vin d’honneur ou le lien vers les suggestions de logement extérieur, respectivement. Les invités au vin d’honneur sans couchage voient aussi le lien. Les deux anciennes listes d’environnement sont supprimées du client et du workflow ; elles ne servent pas de fallback pour les champs non renseignés. Seule `NEXT_PUBLIC_CODES_RSVP` continue à déterminer l’affichage du formulaire. Les changements de flags prennent effet à la prochaine lecture Firestore sans nouvelle construction. Les réponses individuelles dans `statuts` et leurs règles de validation sont conservées. Ces conditions d’affichage ne prouvent pas un contrôle d’accès serveur.

### Fluidité Noces et qualité des images

GSAP/ScrollTrigger remplace l'easing et le plafond de cadence maison. Les originaux 1280×720 sont affichés sans réencodage ; la densité temporelle est adaptée au parcours, environ 16 pixels de scroll par position et au maximum 597 positions. Les pixels restent décodés dans une fenêtre bornée et les données compressées sont préparées sur tout le parcours. Les spritesheets photographiques basse définition sont écartées. Seul le masque lumineux est préparé hors ligne. Les callbacks ScrollTrigger mettent à jour directement le décor et les scènes ; les autres notifications asynchrones restent regroupées par raf. Les photos des scènes sont préparées séquentiellement sur les profils mobiles/tactiles pour déplacer leur décodage avant les fondus. Sur PC, le chargement natif est conservé après comparaison mitigée de la préparation anticipée. La fenêtre conserve désormais 16/24 bitmaps et une voie de décodage urgente ; les mesures montrent un gain de mémoire et de suivi des images, sans disparition des tâches longues. Une inversion réinitialise la borne monotone de présentation pour corriger le blocage d’une image en retard malgré un bitmap prêt ; le premier recalage peut être visible. Ce choix est en validation dans [le plan GSAP](plans/active/noces-gsap-native-quality.md).

### Site statique et données client

Conserver Next.js App Router avec export statique GitHub Pages sous `/wedding`. Les invitations et statuts restent dans Firestore, avec Authentication pour la connexion admin. Les règles effectives Firebase ne sont pas versionnées ; ne pas déduire la sécurité du seul affichage client.

### Accès rapide aux informations

La landing donne accès au RSVP et aux informations depuis le hero. Les invités passent par leur code pour ouvrir l’invitation, puis répondent individuellement. Les détails secondaires utilisent des disclosures natifs pour limiter le défilement. Deux panneaux ont une hauteur égale dès 768px ; sur téléphone, RSVP puis informations s’empilent. La carte du voyage est visible avant les FAQ.

L’action du code s’appelle « Accéder à mon invitation », car elle ne sauvegarde pas une réponse. Le programme précise que les événements accessibles dépendent de l’invitation. Conserver l’échéance du 31 décembre 2026 et le programme provisoire sans inventer de nouveaux horaires.

### Identité visuelle préservée

Le hero remplit au minimum le viewport sur téléphone, tablette et PC, avec un lien de défilement dans le flux et une croissance naturelle sur les écrans courts. Conserver l’aurore initiale (blend 0.4, amplitude 0.7, speed 0.2), ses couleurs au breakpoint de 1000px et son dégradé diagonal. Le logo reprend 50 % de largeur jusqu’à 240px ; les noms prennent pleine largeur jusqu’à 672px. `domaine.svg` garde son ratio, sans recadrage. Les particules ne sont pas remontées.

Le countdown est simplifié à un nombre de jours, recalculé chaque minute, avec offset horaire français explicite. Les styles de réduction des mouvements concernent la signature/CSS ; ils ne suspendent pas actuellement le canvas Aurora.

### RSVP plus compact sur les grands écrans

Deux colonnes dès 768px pour les champs réponse/email et les cartes d’événements, titres/icônes plus petits, marges réduites, cartes d’invités en auto-fit. Email facultatif conformément au libellé, commentaires associés à leur label. Le mécanisme de sauvegarde Firestore reste celui existant.

### Contact par e-mail

Ne pas afficher les numéros personnels de Solenne et Dorian. Landing et aide en cas d’erreur de confirmation proposent un bouton `mailto:` aux deux mariés. Les coordonnées publiques des établissements d’hébergement restent distinctes.

### Voyage de noces encore en préparation

Présenter un roadtrip d’un mois au Japon. Conserver les cinq destinations envisagées comme exemples modifiables, sans plages de jours définitives. Le voyage forme un hero unique : fond Torii de 597 WebP, introduction, présentation, cinq cartes photo et cadeau. Les scènes restent fixes et disparaissent par opacité avant l’apparition de la suivante. Navbar, menu, avion, curseur personnalisé, scrollbar visible et écran footer sont supprimés à la demande des propriétaires. Accueil reste dans l’introduction et le cadeau. Les textes sont conservés ; les photos locales illustrent les envies sans figer le programme. Pour les performances : canvas/cache bornés, décodage asynchrone et arrêt au repos. Réduction des mouvements et absence de JavaScript conservent tous les textes dans le flux avec un fond statique. La participation reste une urne au mariage, sans paiement en ligne.

### Galeries non annoncées comme prêtes

La landing indique « bientôt disponible ». Les deux routes de prototype existent mais leurs contrôles de code ne valident pas Firestore. La galerie OneDrive garde des liens à compléter et des nombres de photos d’exemple.

## Choix remplacés

- Le premier refactoring proposait un hero compact sur téléphone : remplacé par un hero plein écran sur toutes les tailles à la demande des propriétaires.
- Le fond statique proposé au début a été remplacé par l’aurore d’origine.
- Le logo et les noms initialement réduits ont retrouvé leurs proportions d’origine.
- L’ancienne page voyage évoquait trois semaines et des étapes datées : remplacée par un mois et des escales provisoires.
- Le hero statique et les placeholders SVG du voyage V1 sont remplacés par le hero séquencé et les dégradés de marque V2 ; les textes et escales V1 sont conservés.
- La première V2 avait une navbar/menu, une timeline avec avion, un hero séparé des étapes et des PNG 4K décodés au scroll. Cette structure est remplacée par le hero partagé et les copies WebP pour corriger les saccades signalées.
- Le premier hero partagé faisait défiler les cartes dans le flux avec 100 frames. Il est remplacé par huit scènes fixes en fondu et la vidéo Torii à 597 frames ; le cadeau termine le parcours sans écran footer supplémentaire.
- Le voile de fond uniformément allégé rendait l’introduction trop peu lisible : remplacé par un dégradé sombre à gauche et clair à droite, avec fond plus sombre sur petits écrans. La carte passe à gauche sur grands écrans ; les descriptions des escales deviennent des volets fermés par défaut sur téléphone/écran court.

Les plans terminés documentent les vérifications de chaque étape. Les anciennes captures ne représentent pas nécessairement les paramètres actuellement en vigueur.

## Admin : lisibilité et CSV

Conserver le séparateur CSV virgule existant et protéger tous les champs avec des guillemets plutôt que de modifier les commentaires. Corriger les colonnes et ajouter l’email. Harmoniser les couleurs du panneau avec le mariage, limiter la liste à des pages et proposer des cartes sur téléphone/tablette. L’export couvre tous les résultats filtrés. Les graphiques et présences affichés excluent les réponses refusées/en attente ; les données enregistrées ne sont pas réécrites.

## Ombre du voyage et compacité mobile

Le dégradé bleu cinématique précédent est remplacé par une ombre gris foncé diagonale, plus sombre en bas à gauche et sur téléphone. Le choix de texture statique de cette étape est remplacé le 4 octobre 2026 par les rayons solaires décrits ci-dessous ; les assets originaux restent conservés. Le panneau fermé n’affiche plus que numéro/ville/chevron ; tous les textes et envies restent accessibles dans le volet.


## Rayons solaires synchronisés au scroll — 4 octobre 2026

Remplacer la texture statique par une illusion volumétrique 2D en perspective. Réutiliser la frame affichée pour garder la lumière synchronisée même pendant le chargement ; masque de luminance pour atténuer les rayons sur les arbres. Pas de ray tracing physique, WebGL supplémentaire, animation autonome ou téléchargement de texture. Résolutions bornées, sprite précalculé et boucle existante arrêtée au repos. Effet absent en réduction des mouvements ; voile sombre et contenus conservés.


À la demande des propriétaires, les trouées solaires sont accentuées : certains faisceaux atteignent 3–4 fois leur largeur initiale et un gain lumineux jusqu’à ×3. Garder une variation progressive au scroll, des rayons fins entre les nappes larges, le masque des arbres et le voile de lisibilité. Résolutions, nombre de faisceaux et arrêt au repos inchangés.


## Cache mémoire du voyage borné : étape remplacée par le buffer réseau ci-dessous

Conserver les 597 frames, le cache décodé 16/24 et le moteur solaire inchangés. Limiter la rétention compressée à 12 Mio sur téléphone et 24 Mio ailleurs avec éviction LRU ; vider ce cache en réduction des mouvements. Préférer cette borne mémoire à une conservation de toute la vidéo (72,55 Mio), avec possibilité de recharger les frames anciennes au retour. Aucune simplification visuelle ni baisse de résolution pour cette passe.

## Buffer réseau du voyage — 4 octobre 2026

Les mesures locales précédentes ne couvraient pas la latence GitHub Pages. Séparer téléchargement et décodage, anticiper la direction/vitesse et la destination du scroll, conserver davantage d’images compressées avant leur usage. Préchargement complet compressé sur PC avec budget 96 Mio ; fenêtre mobile avec budget 48 Mio. Seulement 24/40 bitmaps préparés autour de la caméra ; budgets réduits à 32 Mio/16 bitmaps et aucun préchargement complet sur appareils signalant ≤4 Gio. Économie de données/2G : concurrence et anticipation réduites, aucun préchargement complet. Accepter davantage de données anticipées et de mémoire bornée pour réduire l’attente réseau, sans charger les 2,05 Gio de frames décodées. Aucun changement des assets, rayons, résolution, cadence ou design. Pause en onglet masqué, première frame seule en réduction des mouvements.
