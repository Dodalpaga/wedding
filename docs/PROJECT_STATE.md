# État du projet

## Motiontemplate : nouvelle direction — 9 octobre 2026

Carte Kinkakuji sur téléphone : inclinaison relative à la première mesure valide, capturée dès le montage lorsque le navigateur autorise les capteurs automatiquement ; activation explicite et neutre après autorisation sur les navigateurs qui l'exigent. Rotation bornée/lissée, recentrage, portrait/paysage, réduction des mouvements, fallback et nettoyage des écouteurs. Cinq tests capteur/lifecycle, TypeScript et export statique isolé réussis. Clavier/reset et mises en page téléphone/tablette/PC contrôlés dans le navigateur de bureau, sans simulation de capteur matériel ; sensation et autorisation sur un vrai téléphone restent à vérifier. [Plan terminé](plans/completed/temple-phone-tilt.md). Aucun déploiement ni lecture/écriture Firebase pendant ces contrôles.

Affinage suivant du 9 octobre : titre entièrement effacé avant le premier mouvement du globe, grâce à un intervalle d'introduction partagé avec le parcours ; rayon de vol augmenté de 1,5 à 1,8 pour réduire encore le recul. La sortie sous les nuages conserve son point de fin. TypeScript, 16 tests ciblés et export statique isolé validés. Le navigateur confirme une caméra inchangée pendant le fondu du titre, puis un titre invisible au début du vol. Aucun déploiement ni écriture Firebase.

Correction du globe Noces du 9 octobre : compensation du facteur de latitude de MapLibre pour supprimer l'agrandissement apparent pendant le survol du nord ; recul réduit, échelle constante pendant le vol et cadrages des pays conservés. TypeScript, 11 tests ciblés du parcours/préchargement et build avec export statique validés (checkout temporaire sous `build/`, les fichiers générés du workspace étant verrouillés). Prévisualisation navigateur de l'export à 320×568, 820×1180 et 1280×720 : globe visible pendant le vol, aucun débordement horizontal ni erreur console observée. Les contrôles numériques couvrent aussi 1440×900 et 844×390, la monotonie des zooms de départ/arrivée et le scroll inverse. Pas de test sur téléphone physique ; réduction des mouvements et formulaires hors périmètre de cette correction. Aucun déploiement ni réponse RSVP soumise.

Le globe, les cadrages des pays entiers, l’avion et les nuages restent en place. Les anciens paysages et leur documentation sont retirés à la demande des propriétaires. Le [parcours](plans/active/motiontemplate-three-experiences.md) intègre Littlest Tokyo, Inakaya et Kinkakuji ; le cube du temple est cadré avec une marge qui conserve son contenu pendant la rotation. La carte Kinkakuji termine maintenant la page : compteur/progression jusqu’à 03/03, texte de clôture et crédits regroupés dans cette scène. Le thème partagé utilise vert profond, beige de fond et blanc clair pour les cartes/FAQ. Les [sources et crédits](MOTIONTEMPLATE_MODELS.md) sont inspectés. Aucun déploiement ni écriture Firebase.


État du code au **5 octobre 2026**. Ce document consolide les notes de refactoring ; les états intermédiaires sont conservés dans les plans/captures et ne sont pas la référence courante.

Correction mobile Noces du 5 octobre : la première correction en `100dvh` supprimait la bande verte après le scroll, mais le signalement sur téléphone a confirmé sa persistance pendant le geste tactile. Cette approche est remplacée pour le décor, sa marge négative et la réserve finale par `100lvh` (fallback `100vh`). Le fond reste peint à la plus grande hauteur pendant le repli de la barre ; le premier plan conserve `100dvh` (fallback `100svh`/`100vh`) et le parcours/contenu restent dimensionnés en `svh`. Les scènes et la séquence utilisent la même distance, en soustrayant la hauteur du décor. TypeScript et build/export validés (11 pages). Chrome headless sur l’export `/wedding/`, 320×568, 820×1180 et 1440×900 : agrandissement/rétablissement du viewport de 90px, simulation de `dvh` retardé en conservant la hauteur initiale du premier plan, couverture du fond/canvas y compris sur les scènes suivante/finale, réduction des mouvements et accès Tab, sans débordement horizontal ni erreur JS. Simulation automatisée, pas de test de la barre Chrome sur téléphone physique. Script, captures et mesures locaux sous `build/check-noces-viewport.cjs`, `build/noces-viewport-*.png`, `build/noces-delayed-dvh-*.png` et `build/noces-viewport-results.json` (ignorés par Git). Requêtes externes bloquées pendant les contrôles ; aucune lecture/écriture Firebase ni publication.

## Fonctionnalités actuelles

### CSV aligné sur le tableau admin (5 octobre 2026)

L’export suit désormais les onze colonnes du tableau et leur ordre, avec les libellés de réponses en français. Repas et Couchage sur place décrivent l’invitation du groupe pour chaque personne : Oui, Non ou Non renseigné, indépendamment du RSVP. Les événements valent Oui seulement pour une réponse confirmée avec la case cochée, sinon « — », comme à l’écran. Tous les résultats filtrés et triés sont exportés, même au-delà de la page courante. La date française complète et les emails/dates absents laissés vides sont conservés pour le suivi. Le format à neuf colonnes et l’export brut des cases d’événements décrits dans les étapes précédentes sont remplacés ; les fichiers déjà téléchargés restent inchangés.

Cinq tests CSV et TypeScript passent : onze colonnes dans l’ordre, trois états des flags, invitations indépendantes des réponses, cases anciennes d’une réponse refusée/en attente, dates, tri sur plusieurs pages, échappement et une ligne physique par invité. Build/export de production isolé validé dans `build/admin-csv-dashboard-production` (11 pages). Données fictives uniquement ; aucune lecture/écriture Firebase ni publication. La mise en page admin est inchangée, sans nouvelle vérification responsive ni nouveau contrôle du téléchargement dans le navigateur.

### CSV : une ligne physique par invité (5 octobre 2026)

Après le signalement de lignes supplémentaires dans les commentaires, l’export remplace les séquences de CR/LF par un espace dans tous les champs. L’ancien comportement conservait ces sauts de ligne dans des cellules entourées de guillemets ; il est remplacé pour garantir une ligne physique par invité même avec des lecteurs qui découpent le fichier par ligne. La base, les réponses et l’affichage des commentaires restent inchangés. À cette étape, neuf colonnes, échappement des guillemets et BOM UTF-8 conservés ; les colonnes sont ensuite étendues comme décrit ci-dessus.

Quatre tests CSV passent : CR, LF, CRLF, lignes vides, caractères spéciaux, alignement et absence de modification des données source. TypeScript et build/export isolé validés (11 pages). Téléchargement depuis le bouton du vrai composant admin avec 43 invités fictifs et pagination de 20 : 44 lignes physiques avec l’en-tête, neuf champs par ligne, aucun CR/LF dans les cellules. Requêtes externes bloquées ; aucune lecture/écriture Firebase et aucune publication. Le CSV signalé n’existait plus au chemin fourni pendant cette vérification : les lignes précises n’ont pas pu être inspectées. Le contrôle du téléchargement utilise une fixture dans `build/`, ignorée par Git. Un export déjà téléchargé ne change pas ; télécharger un nouveau CSV après mise en ligne du correctif.

### Migration repas et couchage appliquée (5 octobre 2026)

Migration appliquée dans Cloud Shell avec succès confirmé par le propriétaire. Le dossier [migration/](../migration/README.md) regroupe le script autonome `migration/update-invitation-flags.mjs`, les tests et la configuration réelle dans un JSON local ignoré par Git. Aperçu par défaut, application explicite avec `--apply`, pagination, validation des exclusions, écriture atomique limitée aux deux champs et préconditions d’horodatage. Les champs décrivent toute l’invitation ; les groupes sans repas sont également sans couchage. Les autres codes valides ont les deux valeurs à `true`.

Tests locaux hors réseau et validation de la configuration locale ; aucun appel ni écriture Firebase par l’agent. Google Cloud CLI n’est pas disponible dans le PATH du poste lors de la préparation. `--cloud-shell` utilise le projet gcloud actif et le JSON importé dans le dossier courant, sans `.env.local`. Lecture/application requièrent une connexion Google avec droits IAM ; l’application a été faite par le propriétaire. La confirmation et le dashboard admin utilisent maintenant les flags ; les anciennes listes d’hébergement et de vin d’honneur ne sont plus utilisées. Voir [la procédure](CONFIGURATION.md#initialiser-les-champs-repas-et-couchage).

### Confirmation : flags Firestore en remplacement des deux listes (5 octobre 2026)

`participation_repas === false` détermine le vin d’honneur uniquement et masque les choix d’événements du formulaire. `couchage_sur_place === false` affiche les suggestions de logement extérieur, y compris pour les groupes au vin d’honneur. Aucun fallback sur les anciennes listes ; les champs absents ne sont pas assimilés à false. La liste `NEXT_PUBLIC_CODES_RSVP` et les écritures RSVP sont conservées. Les deux anciennes variables sont supprimées du code, du workflow et du `.env.local` local, sans afficher ses valeurs. Les éventuels secrets GitHub encore présents ne sont plus utilisés.

TypeScript passe ; les copies de validation temporaires sous `build/` et les exports sous `out/` sont maintenant exclus de son périmètre. Build/export validé dans une copie isolée (11 pages). Contrôles de la véritable page et du véritable formulaire avec Firestore remplacé par une fixture uniquement dans la copie de test : quatre invitations fictives (avec couchage, sans couchage, vin d’honneur, flags absents) à 320×568, 820×1180 et 1440×900 ; lien d’hébergement, badge, trois cases d’événements actives et case samedi midi désactivée, masquage au vin d’honneur, accès clavier, code invalide et absence de débordement/erreur JavaScript vérifiés. Requêtes externes bloquées et écritures de fixture interdites ; aucune lecture ou écriture de la base réelle, aucune réponse soumise, aucun déploiement. Scripts et captures locaux dans `build/confirmation-flags-*`, ignorés par Git.

### Admin : flags et ratios repas/couchage (5 octobre 2026)

Les deux flags d’invitation sont reportés sur chaque membre dans le tableau et les cartes mobiles, avec tri. Deux indicateurs affichent les ratios membres acceptés / membres invités (`flag === true`). Les invités refusés/en attente restent dans le total des invités concernés ; les données absentes ou invalides sont signalées et exclues du ratio. Les compteurs utilisent l’ensemble des invités et ne dépendent ni des filtres/pagination ni des cases des événements du week-end. Les réponses RSVP sont conservées. Le CSV restait à neuf colonnes lors de cette étape ; il est désormais aligné sur le tableau comme décrit ci-dessus. La confirmation utilise maintenant les flags, comme décrit ci-dessous.

Validation : deux tests de statistiques et trois tests CSV passent, TypeScript passe. Le build à la racine a compilé puis échoué sur un fichier généré `/_document` ; le build/export réussit dans une copie isolée (`build/admin-flags-production`, 11 pages). Interface vérifiée avec 43 invités fictifs à 320×568, 820×1180 et 1440×900, avec réduction des mouvements : ratios 14/40 au repas et 7/20 au couchage, stables après filtre ; flags Oui/Non/Non renseigné, tri mobile et tableau, tri clavier, pagination, recherche, état vide et absence de débordement horizontal ou d’erreur JavaScript. Script/fixtures/captures locaux dans `build/`, ignorés par Git. La fixture ne charge pas Firebase et les requêtes externes sont bloquées ; aucun accès ni écriture à la base réelle, aucune authentification réelle ni publication. Ces essais ne remplacent pas une vérification sur téléphone physique.

Passe Noces du 4 octobre 2026 : essais précédents initialement archivés, puis stash supprimé à la demande de l’utilisateur, GSAP/ScrollTrigger installé pour le fond et les scènes. Images originales conservées, densité temporelle adaptée au parcours, au maximum 597 positions, sans réserve basse définition ; masque lumineux hors ligne et cache de bitmaps borné. Vingt-deux tests ciblés, TypeScript et export isolé passent (11 pages, route Noces 55,1 kB / 149 kB de premier chargement JS). La première variante HTMLImageElement a échoué aux mesures de composition et a été remplacée. Les parcours passent sur trois formats, mais les mesures conservent des retards sous scroll rapide et réseau froid : l’objectif « aucun lag » reste ouvert. [Mesures et limites](screenshots/noces-gsap-adaptive/README.md). [Plan et vérifications en cours](plans/active/noces-gsap-native-quality.md). Dernière passe : suppression du raf supplémentaire après ScrollTrigger et préparation des photos sur mobile/tactile ; premières traversées rapides sans tâche longue sur téléphone/tablette simulés, mais des pauses persistent lors des répétitions. [Comparaison et limites](screenshots/noces-last-stutters/README.md). Dernier réglage : voie urgente de décodage et cache 16/24, sans baisse de qualité ; mémoire réduite et meilleur suivi des images, mais nombre de tâches longues similaire. [Mesures](screenshots/noces-decoder-priority/README.md). Correction suivante : réinitialisation de la présentation aux changements de sens, après reproduction d’un blocage avec image prête. Chrome Windows PC et inversions rapides vérifiés ; des pauses et un recalage de début d’inversion peuvent encore être visibles. [Diagnostic et limites](screenshots/noces-reversal-freeze/README.md). Aucun déploiement ni écriture Firebase.

| Zone | État |
| --- | --- |
| Landing | Hero plein écran, aurore et proportions logo/noms d’origine, countdown en jours, ancres RSVP/infos. |
| Informations | RSVP en premier sur mobile, panneaux alignés dès 768px, domaine sans crop, programme/transport/conseils/FAQ repliables, compteur des invités confirmés. |
| Contact | Boutons e-mail sur la landing et l’erreur de confirmation ; aucun numéro personnel des mariés dans le code des pages. |
| Confirmation | Invitation Firestore, catégories configurées, réponse par membre et édition des réponses existantes. |
| RSVP | Layout compact sur tablette/PC, email facultatif, commentaires, événements selon catégorie et réponse. |
| Hébergement | Neuf suggestions locales filtrables ; coordonnées publiques des prestataires. |
| Voyage | Hero Torii 597 WebP et rayons solaires au scroll : huit scènes fixes en fondu, cinq cartes photo et cadeau avec retour Accueil. Sans navbar/menu/avion/footer/curseur personnalisé/scrollbar visible ; textes V1 conservés, rendu arrêté au repos. |
| Admin | Connexion Firebase, statistiques, tri/recherche/filtres et export CSV ; limites ci-dessous. |
| Galeries | Prototypes existants, non proposés comme disponibles depuis la landing. |

Le programme détaillé du mariage et les villes/ordre/durées du Japon restent à finaliser avec les propriétaires. Les visuels du voyage peuvent être remplacés par des photos locales via `tripSteps.image`.

## Vérifications réalisées

- TypeScript a passé les contrôles après les refactorings et les derniers changements de lien/contact.
- Compilation de production et export statique réussis dans des copies propres, dont la version avec refactoring du voyage : 11 pages générées par Next. Les derniers petits changements lien/contact ont été contrôlés par TypeScript, sans nouveau build complet.
- Landing vérifiée à 320/375/390px, tablette portrait/paysage et PC 1440px : pas de débordement horizontal ; hero plein écran sur les tailles portrait et croissance sûre sur écran court/paysage ; panneaux de même hauteur même après expansion. Ces captures précèdent la restauration finale de taille logo/noms et de l’aurore.
- Trois catégories d’invitation réelles vérifiées en lecture : week-end avec logement réservé, week-end sans logement réservé, cérémonie/vin d’honneur. Les liens, badges et choix correspondent aux catégories ; la saisie de code en minuscules fonctionne.
- Acceptation week-end sans événement désactivée, sélection d’un événement activée, refus masquant les événements ; valeurs existantes chargées. Aucun clic de sauvegarde finale : aucun RSVP écrit pendant ces vérifications.
- Voyage vérifié à 320, 390, 820 et 1440px : absence de débordement, colonnes alternées sur tablette/PC, ancre d’itinéraire et avion progressant au scroll.
- Audit documentaire : README, consignes, docs, scripts, variables, schéma et routes confrontés au code. Aucun déploiement ni changement de données effectué.

Les contrôles UI ne valent pas validation de la persistance ou audit complet de sécurité. L’admin et les galeries n’ont pas fait l’objet d’un nouveau contrôle interactif pendant cette mise à jour documentaire. Voir [l’index des captures](screenshots/README.md) pour leur portée.

## Limites et incohérences connues

| Point | Observation dans le code |
| --- | --- |
| Modèle de membres | Le statut utilise le nom comme identifiant : collisions possibles entre homonymes, `/` non compatible avec cet identifiant. |
| Sauvegarde RSVP | Deux écritures séquentielles, sans transaction. Les événements masqués gardent leurs valeurs locales lors de l’écriture. |
| Accès Firebase/admin | Règles absentes du dépôt ; aucune définition de rôle admin dans le client. Leur configuration réelle n’a pas été auditée. Le compteur et RSVP lisent des collections entières. |
| Galeries | Présence d’un code dans l’URL seulement ; aucune validation d’invitation. Photos locales de démonstration, nombreux liens OneDrive et compteurs encore provisoires. |
| Images hébergements | Chemins `/wedding/hebergements/...` codés en dur : erreurs 404 observées en développement sans basePath. Le préfixe correspond à la production, sans établir que toutes les images de production ont été vérifiées. |
| Préchargement de police | Le layout utilise `/fonts/Wedding.otf` sans basePath ; vérifier le preload sous `/wedding`. La police des styles est aussi chargée via CSS. |
| Réduction des mouvements | Signature/CSS landing et animations du voyage prises en compte ; canvas Aurora encore animé. |
| Scripts npm | `export` utilise encore `next export` et `start` n’est pas adapté à l’export statique. Suite ciblée CSV disponible ; aucune configuration ESLint dédiée. |
| Outils de build | Avertissements Browserslist/Baseline obsolètes ; dépendances inchangées. `.next/trace` a été verrouillé lors de contrôles locaux, d’où les copies propres. |

Ces observations ont été documentées, sans correction applicative supplémentaire dans la tâche de documentation.

## Suite possible

Finaliser le programme, les escales et photos du Japon ; corriger les chemins d’assets ; définir/valider les règles d’accès Firebase avant toute affirmation de confidentialité ; terminer ou retirer les prototypes de galeries ; vérifier les sauvegardes sur une base de test. Les demandes de design actuelles et l’accès au voyage depuis la landing sont implémentés.

## Admin et CSV : correction

Correction initiale, remplacée pour les colonnes et les retours à la ligne par les étapes du 5 octobre ci-dessus : neuf colonnes alignées, email inclus, colonne samedi midi supprimée. Guillemets doublés et champs cités préservaient les virgules/retours à la ligne ; BOM UTF-8 et lignes CRLF. Export de tous les résultats filtrés/triés, sans limiter à la page affichée. Trois tests de non-régression passaient à cette étape.

Panneau harmonisé bleu profond/vert, cartes statistiques, événements compacts, champs étiquetés, tri au clavier, pagination et cartes mobile/tablette. Les événements comptent seulement les confirmations, même si une ancienne réponse refusée garde ses cases cochées. Écoute Firebase unique avec nettoyage et erreurs visibles. Interface vérifiée avec 43 invités fictifs à 320, 390, 820, 1024 et 1440px : pas de débordement de page, filtres/réinitialisation, pages, état vide et lecture des commentaires vérifiés. Formulaire de connexion vérifié visuellement sans connexion à un compte réel. L’événement de téléchargement du navigateur de test n’a pas pu être capturé ; le contenu généré est validé par les tests CSV. Aucune réponse réelle ni donnée Firebase n’a été modifiée.

TypeScript et compilation/export de production validés dans une copie propre (11 pages). La route temporaire de prévisualisation fictive a été retirée avant la construction et ne fait pas partie du site livré. Les tests CSV se lancent avec `npm run test:csv`.

## Première V2 : validations historiques du 3 octobre 2026

La navbar, le menu, la timeline/avion et le chargement des PNG décrits ici ont ensuite été remplacés par le hero unique optimisé (voir la dernière validation ci-dessous).

- TypeScript validé ; compilation et export statique réussis (11 pages) dans une copie isolée, car `.next/trace` du checkout était verrouillé. La copie de validation exclut le ZIP source et n’est pas publiée.
- Export testé sous `/wedding/` avec Chrome headless à 320×568, 390×844, 820×1180, 1440×900 et 844×390 : aucun débordement horizontal ni erreur JavaScript. Captures inspectées sur téléphone, tablette et PC.
- Menu : ouverture, focus initial, boucle Tab/Shift+Tab, Échap, clic sur le fond, restauration du focus/body scroll et navigation vers le cadeau contrôlés. CTA tactile vers l’itinéraire et lien Accueil préfixé vérifiés.
- Séquence : carte sur Kyoto à 55 %, dernière frame rendue comparée au pixel central de l’original 100, DPR plafonné à 2 et redimensionnement vérifiés. Les 100 PNG extraits sont identiques à l’archive par SHA-256 ; le type, les commentaires, les données et textes V1 ont été comparés automatiquement.
- Curseur : état VOIR sur un visuel et contraction au clic vérifiés ; absent en tactile et en réduction des mouvements. Réduction des mouvements : une seule requête de frame, hero statique sans longue zone sticky ; changement de préférence à chaud contrôlé.
- Aucun appel ni écriture Firebase effectué par ces vérifications de `/noces/`. Aucun déploiement effectué. Les captures et contrôles ne constituent pas une mesure des performances sur un téléphone physique ou un réseau mobile lent. Les originaux totalisent environ 655 Mo ; le chargement progressif limite les requêtes et la mémoire, sans modifier les images.

## Premier hero unique du voyage : validation historique du 3 octobre 2026

- Navbar/menu et timeline/avion supprimés. Introduction, cinq escales, cadeau et footer apparaissent au premier plan d’un fond sticky unique. Type, commentaires et textes V1 inchangés (comparaison automatique).
- PNG originaux conservés ; copies WebP sans crop : 100 frames mobiles à 1280px (10,86 Mio) et 100 desktop à 1920px (16,46 Mio), qualité 78. Le navigateur n’a demandé aucun PNG pendant les contrôles.
- TypeScript validé et compilation/export de production réussis dans une copie isolée : 11 pages. Route `/noces` : 5,83 kB et 100 kB de premier chargement JS, contre 50 kB et 144 kB dans la première V2.
- Chrome headless sous `/wedding/` à 320×568, 390×844, 820×1180, 1440×900 et 844×390 (DPR 2) : aucun débordement ni erreur JavaScript. Fond toujours sticky devant chaque escale ; cartes dans le flux sans contenu masqué ; cibles de 44px, lien d’évitement/focus, ancres, retour Accueil, tactile et resize contrôlés.
- Au repos : zéro callback rAF et zéro dessin du canvas pendant les fenêtres de mesure. Réduction des mouvements : une seule URL de frame, première image statique et aucun curseur ; changement de préférence à chaud vérifié.
- Mesure indicative avant/après en Chrome headless, viewport mobile 390×844/DPR 2 et CPU ralenti ×4, progression de scroll normalisée sur la séquence : intervalle de rendu au 95e percentile 1282,4 → 16,8 ms ; callbacks rAF au repos 61 → 0/seconde ; 96,81 → 10,99 Mio de données de frames observées dans le scénario. Les dessins utiles passent de 6 à 99. [Rapport brut](screenshots/noces-hero/performance-report.json).
- Aucun appel/écriture Firebase et aucun déploiement. La mesure est un essai ponctuel sur navigateur automatisé, pas un engagement de FPS sur un téléphone physique ou un réseau lent. Les captures actuelles sont dans [l’index](screenshots/README.md) ; celles de la première V2 restent historiques.

La dernière frame rendue a aussi été comparée à la copie WebP 100. Les cas images bloquées et JavaScript désactivé conservent les textes, ancres et fond de secours/poster ; les interactions du curseur restent vérifiées.

## Nouvelle vidéo Torii : extraction complète

`public/assets/Torii_better_fps.mp4` : 1280×720, 120 fps, 4,975 s, 597 frames décodées. Extraction avec FFmpeg 9.0.2 portable dans `public/assets/torii-better-fps-frames/` : `frame-000001.webp` à `frame-000597.webp`, qualité 85, sans resize/crop/changement de cadence ; 72,55 Mio. Compte, numérotation, format/dimensions des 597 WebP et intégrité du MP4 vérifiés. Script reproductible : `scripts/extract-video-frames.ps1`, [guide Windows](VIDEO_FRAMES.md). Cette séquence a ensuite été activée dans le hero en fondu décrit ci-dessous. Aucune donnée Firebase ni publication.

## Scènes fixes et cartes photo : état actuel

- Huit scènes fixes avec fond Torii 597 frames ; disparition complète entre les scènes, sans translation des cartes. Scroll encouragé uniquement dans l’introduction, précédent/suivant et ancres fonctionnels. Suppression du footer et ajout du Next Link « Retour à l’accueil » dans le cadeau. Scrollbar masquée sur `/noces` uniquement et curseur natif conservé.
- Cinq photos locales WebP (1600px, qualité 82, total 2,60 Mio), panneau sombre de marque et highlights conservés. Sources Unsplash et remplacement documentés dans [VIDEO_FRAMES.md](VIDEO_FRAMES.md). Le placeholder reste disponible si `image` est absent. Comparaison automatique des textes V1, type/commentaires et données des cinq étapes, en autorisant uniquement l’ajout des chemins d’images.
- TypeScript et build/export validés : 11 pages, `/noces` 6,71 kB et 101 kB de premier chargement JS. Build dans une copie isolée, la racine ayant toujours le verrou `.next/trace`.
- Chrome headless sous `/wedding/` : 320×568, 390×844, 820×1180, 1440×900 et 844×390/DPR 2. Cartes stationnaires, intervalle sans chevauchement des scènes, absence de débordement horizontal et d’erreur JavaScript ; clavier/focus, tactile, resize, ancres, photos décodées et dernière frame contrôlés. Les écrans 320px et paysage court utilisent un défilement intérieur pour conserver tous les textes.
- Réduction des mouvements : une seule frame statique, contenu dans le flux, pas de scène `inert` ; changement de préférence à chaud contrôlé. Sans JavaScript : poster et toutes les étapes accessibles. Frames bloquées : cadeau toujours accessible. Les liens directs vers les escales sont réappliqués après l’ancrage natif/Next de début de visite.
- Au repos après stabilisation : zéro callback rAF et zéro dessin. Mesure ponctuelle Chrome headless mobile/DPR 2/CPU ×4 : intervalle rAF P95 33,3 ms, plus grand intervalle 133,2 ms, trois tâches longues ; voir [rapport brut](screenshots/noces-fades/performance-report.json). La séquence native contient davantage de frames que la précédente ; le préchargement reste progressif. Pas de garantie de FPS sur appareil physique/réseau lent.
- Aucun RSVP soumis, aucune donnée écrite ni publication. Captures et rapport UI dans [l’index](screenshots/README.md).

## Carte d’ensemble et fond allégé

Cette présentation intermédiaire est remplacée par le dégradé cinématique et les volets compacts décrits ci-dessous.

La carte WebP fournie par les propriétaires est ajoutée à « Nos envies d’escales », à droite dès 768px et sous le texte sur téléphone. Copie binaire identique à la source (SHA-256 contrôlé), 1760×2404 avec transparence, 73 050 octets. Léger contraste/saturation et ombre en CSS ; le bord parasite inférieur est masqué sur 2px à l’affichage, sans modifier le fichier. Le voile de fond passe de 68→25 % à 40→10 % horizontalement, et de 55 à 28 % en bas ; une ombre sur les textes d’introduction conserve la lisibilité.

TypeScript et build/export isolé validés (11 pages). Chrome headless sous `/wedding/` sur 320×568, 390×844, 820×1180, 1440×900 et 844×390/DPR 2 : image chargée, position responsive, aucune erreur JavaScript ni débordement horizontal ; passage vers Tokyo et focus contrôlés. Carte également accessible en réduction des mouvements et sans JavaScript. Les écrans courts conservent un défilement intérieur. Aucun appel Firebase, aucune donnée écrite ni publication. Captures dans [l’index](screenshots/README.md).

## Hero cinématique et volets compacts : étape précédente

- Dégradé bleu de marque sombre derrière l’introduction à gauche (94→8 % vers la droite), fond plus sombre sur téléphone/écran court. Introduction élargie à presque toute la largeur avec marge limitée ; carte à gauche et présentation à droite dès 768px, ordre mobile conservé.
- Volets natifs `StepDrawer` fermés par défaut sous 768px ou sous 601px de hauteur. Numéro/ville et incitation restent visibles ; titre, description et highlights se révèlent au clic, au toucher ou via Entrée/Espace. Corps focusable et défilement intérieur pour lire sans avancer la séquence. Descriptions ouvertes sur grands écrans ; resize réappliquant le mode approprié. Tous les textes et assets conservés.
- TypeScript et build/export isolé validés : 11 pages, `/noces` 7,04 kB et 101 kB de premier chargement JS. Comparaison du contenu V1 et liens documentaires validés.
- Chrome headless sous `/wedding/`, DPR 2 : 320×568, 390×844, 820×1180, 1440×900, 2560×1440 et 844×390. Les cinq volets, défaut fermé/ouvert, ouverture/fermeture, focus, lecture au clavier, resize et navigation ont été contrôlés. Carte inversée, introduction proche du bord sur écrans larges, absence de débordement horizontal et de chevauchement des commandes après ouverture. Tactile, réduction des mouvements et fallback natif sans JavaScript validés ; aucune erreur JavaScript.
- Aucun callback rAF ni dessin du canvas au repos après stabilisation. Ces contrôles automatisés ne remplacent pas des essais sur téléphone physique/réseau lent. Aucun appel Firebase, aucune donnée écrite ni publication ; captures et rapport dans [l’index](screenshots/README.md).

## Ombre diagonale et panneau mobile minimal : itérations précédentes

Le voile bleu précédent est remplacé par une ombre gris foncé à 45°, sombre jusqu’au premier tiers depuis le bas gauche, adoucie au deuxième tiers et transparente à la fin. Le téléphone garde un fond plus sombre. Deux textures originales sont configurables dans `background-treatment.ts` : ombres en multiply à 80 % (2, active) et fuite de lumière en screen à 10 % (1). Le masque et les niveaux de gris sont uniquement CSS ; une seule texture est chargée, sans ajout de travail à la boucle JavaScript de frames.

Le panneau mobile fermé contient une seule commande numéro/ville/chevron, sans label redondant ni ligne d’ouverture supplémentaire. Les descriptions et highlights complets restent dans le volet. Padding et espacements sont resserrés ; cible native de 44px minimum, accès clavier/tactile et lecture intérieure conservés.

TypeScript, contenu V1 et build/export isolé validés : 11 pages, `/noces` 7,2 kB/101 kB. Chrome headless sous `/wedding/`, DPR 2, six tailles (320×568 à 2560×1440, dont paysage 844×390) : cinq volets, navigation, clavier, tactile, resize, réduction des mouvements et no-JS ; aucun débordement ni chevauchement des commandes, aucune erreur JavaScript. Panneau Tokyo fermé sous 90px sur écrans compacts. Aucun callback rAF/dessin au repos. Les deux variantes ont été inspectées visuellement ; pas de mesure de fluidité sur téléphone physique. Aucun appel Firebase, aucune écriture de données ni publication.


Essai de texture accentuée : opacité 22→80 %, masque conservant 90 % d’intensité au deuxième tiers, voile gris PC réduit à 65→20→0 % pour laisser ressortir les bandes. Téléphone toujours plus sombre (82→78→58→42 %). Changement de traitement visuel uniquement ; volets et moteur inchangés. Les captures précédentes montrent le réglage discret.

TypeScript validé après ce réglage. Aperçus du CSS/config actuels sur l’export précédent à 390, 820 et 1440px sans débordement horizontal ; pas de nouveau build ni reprise des contrôles fonctionnels complets pour ce changement visuel limité. Captures accentuées dans [l’index](screenshots/README.md).


## Dégradé rétabli : étape précédente

Dégradé gris diagonal original restauré : PC 88→88→42→0 %, téléphone/écran court 90→86→70→42 %. Les réglages des propriétaires dans `background-treatment.ts` sont conservés : texture 2 en screen à 100 %. Masque de texture étendu conservé ; volets et moteur inchangés. Les captures existantes précèdent cette combinaison. La texture statique de cette étape est remplacée par les rayons solaires le 4 octobre 2026.


## Rayons solaires au scroll : état actuel (4 octobre 2026)

La texture statique est remplacée par des faisceaux procéduraux chauds en perspective synchronisés à la frame Torii visible. Élargissement à l’approche, modulation de canopée et atténuation sur les arbres via masque de luminance ; occlusion approximative 2D, sans reconstruction géométrique ni ray tracing physique. Canvas 480/720px et masque 128/160px maximum, 9/14 faisceaux, sprite précalculé, aucune dépendance/texture supplémentaire. Le voile gris original et la lecture des contenus restent conservés. Aucun timer ni re-render React au scroll ; arrêt au repos/onglet masqué. Effet masqué/effacé en réduction des mouvements et absent sans JavaScript.

TypeScript et build/export de production isolé validés : 11 pages, /noces 8,04 kB et 102 kB de premier chargement JS. Chrome headless sous /wedding/, DPR 2 : 320×568, 820×1180, 1440×900 et 844×390 ; scroll avant/arrière (rendu identique au retour), resize/orientation, absence de débordement et d’erreur JS, volets au clavier, changements à chaud de préférence et fallback sans JavaScript contrôlés. Réduction des mouvements dès le chargement : une seule URL de frame et aucun rayon. Zéro callback rAF/dessin au repos dans les fenêtres de contrôle. Aucune requête de texture.

Mesure indicative à 390×844, CPU ×4, même progression sur les premiers 15 % de la séquence : coût CPU des callbacks rAF au p95 4.5 → 7.3 ms ; traitement solaire seul au p95 5.6 ms. Comparaison avec l’export historique noces-drawer-validation (même séquence et renderer avant rayons) ; textures/voile de cette ancienne capture peuvent différer. Mesure ponctuelle locale, pas une mesure de FPS ni une garantie sur téléphone physique/réseau lent ; tâches longues et dispersion sont conservées dans le rapport brut. Les coûts de décodage vidéo et composition GPU ne sont pas entièrement représentés par le temps des callbacks. [Captures et rapports](screenshots/README.md). Aucun appel/écriture Firebase, RSVP soumis ou déploiement.


### Rayons accentués : réglage actuel

Deux tiers des faisceaux varient jusqu’à ×4 en largeur lors des trouées solaires ; un tiers reste fin. Gain lumineux progressif jusqu’à ×3, alpha plafonné à 1 pour éviter les valeurs invalides et laisser saturer les cœurs lumineux. Variation réversible au scroll, même masque et résolutions, aucun sprite/dessin supplémentaire. TypeScript et export isolé validés ; contrôles visuels sur 320×568, 820×1180 et 1440×900, scroll, zéro dessin au repos, réduction des mouvements et absence d’erreurs/débordement. Les mesures CPU ci-dessus et les premières captures solaires concernent la première intensité, pas ce réglage accentué ; aucune nouvelle mesure de FPS sur appareil physique. Aucun appel/écriture Firebase ni déploiement.


### Correction du rendu en développement

La réexécution des effets au montage en Strict Mode conservait les dimensions du canvas vidéo mais recréait le moteur solaire avec sa taille interne de 1×1. Son resize était conditionné à un changement de dimensions vidéo : le second montage ne dessinait donc plus les rayons visibles, contrairement à l’export de production. L’initialisation du renderer solaire est désormais indépendante de cette condition ; un resize inchangé conserve le canvas et évite les dessins supplémentaires. Rendu contrôlé sur le serveur npm run dev à /noces/ : rayons visibles après reload et pendant le scroll, aucune erreur JS. TypeScript et export de production isolé validés. [Capture en développement](screenshots/noces-solar-rays/solar-dev-fixed.png). Aucun appel/écriture Firebase ni déploiement.


### Passe performances précédente : limites remplacées par le buffer réseau ci-dessous

TypeScript, les trois tests du cache (LRU, remplacement/clear, parcours complet) et export isolé validés : 11 pages, /noces 8,29 kB et 102 kB de premier chargement JS. Simulation avec les tailles réelles des 597 frames : rétention compressée auparavant potentiellement 72,55 Mio, désormais ≤12/24 Mio. Ce budget concerne les blobs conservés, pas toute la mémoire du navigateur (bitmaps, canvas et requêtes en cours restent distincts). Le moteur solaire est conservé strictement à l’identique, vérifié par SHA-256 ; aucune couleur, largeur, luminosité, résolution, cadence, frame ou disposition modifiée.

Chrome headless sous /wedding/ : 320×568, 820×1180, 1440×900 et 844×390/DPR 2 ; scroll avant/arrière, resize, clavier/volets, réduction des mouvements à chaud et dès le chargement (une URL de frame), no-JS, zéro dessin/callback au repos et absence d’erreurs/débordements contrôlés. Vérification complémentaire sur le serveur de développement avec Strict Mode.

Essai ponctuel 390×844/CPU ×4 sur les premiers 15 % de la séquence : callbacks rAF au p95 7.5 → 7.5 ms ; traitement solaire 10.1 → 5.7 ms. Les variations de décodage/ordonnancement sont conservées dans le rapport ; pas de gain CPU/FPS fiable revendiqué. L’optimisation retenue est la rétention mémoire bornée. Un retour lointain peut nécessiter de nouvelles lectures/requêtes, selon le cache HTTP. Aucun essai sur téléphone physique/réseau lent ni déploiement ; aucune donnée Firebase lue/écrite. [Rapports](screenshots/README.md).

### Buffer réseau : état actuel

Après les pauses signalées sur GitHub Pages, téléchargement et décodage sont séparés. Anticipation de 64–128 frames sur téléphone, 96–192 sur PC, priorité à la frame courante et à la destination du scroll. Jusqu’à 6/8 transferts et 2 décodages ; préchargement complet compressé sur PC, fenêtre mobile ailleurs. Budgets compressés 48/96 Mio et 24/40 bitmaps ; réduction à 32 Mio/16 bitmaps sans préchargement complet si mémoire signalée ≤4 Gio. Connexions économes/2G : concurrence 2, anticipation réduite et aucun préchargement complet. Transferts suspendus en onglet masqué, première frame seule en réduction des mouvements. Moteur solaire identique après normalisation des fins de ligne ; images, CSS, easing et cadence inchangés.

TypeScript, huit tests du scheduler/cache et export isolé validés : 11 pages, /noces 9,47 kB et 104 kB de premier chargement JS. Chrome headless DPR 2 : 320×568, 820×1180, 1440×900, 844×390 ; scroll avant/arrière, resize, clavier, réduction des mouvements initiale/à chaud (une URL de frame), fallback sans JavaScript, aucune erreur/débordement, zéro callback/dessin au repos. Parcours téléphone CPU ×4 : callback p95 4,3 ms, avec tâches longues conservées dans le rapport ; pas de garantie sur téléphone physique.

Serveur de développement `/noces/` contrôlé avec Strict Mode : rayons visibles après reload et scroll, aucune erreur JavaScript.

Comparaison des exports avant/après, Chrome, délai serveur de 150 ms par frame, débit 20 Mbit/s, cache désactivé, démarrage du scroll 2,5 s après première image : sur 121 positions des frames 0→120, nombre de changements visibles 47→117 sur téléphone et 67→117 sur PC. Écart position cible/image visible au p95 : 13→3 frames et 12→3 ; il inclut l’easing conservé. Retour 120→60 : écart p95 2 frames dans les deux versions. Réception anticipée sur l’essai complet : 13,7→20,8 Mo téléphone et 16→39,1 Mo PC. Mesure locale synthétique, pas un benchmark du CDN réel ni des FPS ; la connexion doit encore recevoir les images avant usage. [Rapports et méthode](screenshots/noces-network-buffer/README.md). Aucun déploiement ni lecture/écriture Firebase.
