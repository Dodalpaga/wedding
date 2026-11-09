# Ã‰tat actuel

Le site possÃ¨de une landing mobile, un RSVP individuel modifiable, les suggestions d'hÃ©bergement, le voyage Noces en 3D et un dashboard admin avec export CSV. Les galeries restent des prototypes. Programme et itinÃ©raire japonais restent provisoires.

Le voyage conserve le globe compensÃ© en latitude, le fondu du titre avant mouvement, la scÃ¨ne `100lvh`, un interlude de scroll vide, Inakaya et la carte Kinkakuji au survol/clavier/inclinaison. Le modèle Little Tokyo et ses variantes web ont été retirés. Documentation historique, captures, ancien renderer vidéo, outils/tests associés, assets sans références et dépendances inutilisées ont été retirés.

## VÃ©rifications

`npm test` exÃ©cute les tests locaux du RSVP/CSV, des invitations et du voyage avec donnÃ©es fictives ; aucune Ã©criture Firebase. TypeScript interdit dÃ©sormais les variables et paramÃ¨tres inutilisÃ©s. AprÃ¨s le retrait de Little Tokyo, `npx tsc --noEmit` et `npm test` (38 tests) passent.

## Refonte visuelle Noces

La page Noces commence désormais par une hero pleine hauteur sur fond papier neutre qui présente le voyage et invite explicitement à faire défiler. Une flèche animée indique l'action et un bouton amène au début du travelling ; la grille reste sur deux colonnes sur tablette et passe à une colonne sur téléphone, avec une variante compacte en paysage. L'animation du bouton respecte `prefers-reduced-motion`, où l'action amène au résumé statique. Le globe n'apparaît qu'ensuite et démarre son animation après cette transition. Sa carte a des couleurs plus franches (océan jade, terres crème, frontières encre, trajet cuivré lumineux) pour évoquer une illustration de carnet de voyage japonais tout en conservant la palette du site. Little Tokyo et son modèle ont été retirés ; l'étape suivante diffuse « JAPAN | Sony FX30 » depuis le lecteur YouTube officiel, muette et uniquement à l'entrée de sa plage de scroll. Les contrôles natifs du lecteur sont actifs, le crédit/lien reste discret et une carte « Le grand départ » présente l'étape. Le globe et ses nuages n'interceptent pas les interactions du lecteur. La lecture demande une action en réduction des mouvements. La caméra Inakaya commence au cadrage correspondant à 10 % de l'ancien trajet, termine désormais à l'intérieur sans ressortir vers une vue dézoomée de la rue et transmet la main plus tôt au carrousel. La visibilité du carrousel est indépendante du numéro de chapitre afin de prévenir toute désynchronisation. Le parcours sticky dure 1100svh ; le carrousel avance au scroll et atteint sa dernière carte à 99 % du parcours, juste avant l'épilogue. Les chapitres sont renumérotés sur six étapes.

Après l'ajout de la carte, des contrôles natifs, de la hero, du style cartographique et des dernières corrections Inakaya/carrousel, `npx tsc --noEmit`, `npm test` (39 tests), `npm run build` et `git diff --check` passent. La prévisualisation a confirmé l'affichage du carrousel et la mise en page sur téléphone. Le navigateur intégré peut bloquer la lecture YouTube ; le fonctionnement du média et de ses contrôles natifs reste à confirmer dans un navigateur utilisateur.

Le canvas de transition des nuages est maintenant redimensionné d'après la scène sticky (auparavant, le renderer se redimensionnait d'après son canevas intrinsèque de 300 × 150, provoquant un rendu dans le coin supérieur gauche). Le lien de crédit vidéo utilise un badge opaque et une icône externe séparée pour éviter leur chevauchement avec les contrôles du lecteur.

## Limites connues

Le mode édition global modifie les réponses RSVP, les présences, l'e-mail et les commentaires des invités visibles sur la page ; les changements se sauvegardent en un lot Firestore ou s'annulent. Les cartes mobiles et les statistiques du tableau ont été resserrées pour limiter le défilement. `npx tsc --noEmit`, `npm test` (38 tests) et le build de production ont réussi lors des contrôles antérieurs. Aucune réponse réelle n'a été écrite ; les règles Firestore de l'admin restent à sécuriser séparément.

- Les rÃ¨gles Firebase et rÃ´les admin ne sont pas dans le dÃ©pÃ´t ; les codes/conditions client ne constituent pas une protection serveur.
- Les galeries ne valident pas les invitations et ne protÃ¨gent pas les images.
- L'inclinaison du tÃ©lÃ©phone est testÃ©e par Ã©vÃ©nements simulÃ©s ; sensation et permissions sur appareil physique restent Ã  vÃ©rifier.
- La couverture mobile a Ã©tÃ© contrÃ´lÃ©e par simulation de repli de barre d'adresse, pas sur une barre Android/iOS physique.
- L'aurore WebGL reste animÃ©e avec rÃ©duction des mouvements ; la signature et Noces ont leurs propres adaptations.
