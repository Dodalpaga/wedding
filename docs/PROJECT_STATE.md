# Ã‰tat actuel

Le site possÃ¨de une landing mobile, un RSVP individuel modifiable, les suggestions d'hÃ©bergement, le voyage Noces en 3D et un dashboard admin avec export CSV. Les galeries restent des prototypes. Programme et itinÃ©raire japonais restent provisoires.

Le voyage conserve le globe compensÃ© en latitude, le fondu du titre avant mouvement, la scÃ¨ne `100lvh`, Littlest Tokyo, Inakaya et la carte Kinkakuji au survol/clavier/inclinaison. Les sources 3D et toutes les signatures sont conservÃ©es hors `public/`. Documentation historique, captures, ancien renderer vidÃ©o, outils/tests associÃ©s, assets sans rÃ©fÃ©rences et dÃ©pendances inutilisÃ©es ont Ã©tÃ© retirÃ©s.

## VÃ©rifications

`npm test` exÃ©cute les tests locaux du RSVP/CSV, des invitations et du voyage avec donnÃ©es fictives ; aucune Ã©criture Firebase. TypeScript interdit dÃ©sormais les variables et paramÃ¨tres inutilisÃ©s. Les dÃ©tails du dernier contrÃ´le de build sont mis Ã  jour Ã  la fin du travail.

## Limites connues

Le mode édition global modifie les réponses RSVP, les présences, l'e-mail et les commentaires des invités visibles sur la page ; les changements se sauvegardent en un lot Firestore ou s'annulent. Les cartes mobiles et les statistiques du tableau ont été resserrées pour limiter le défilement. `npx tsc --noEmit`, `npm test` (37 tests) et le build de production ont réussi. Aucune réponse réelle n'a été écrite ; les règles Firestore de l'admin restent à sécuriser séparément.

- Les rÃ¨gles Firebase et rÃ´les admin ne sont pas dans le dÃ©pÃ´t ; les codes/conditions client ne constituent pas une protection serveur.
- Les galeries ne valident pas les invitations et ne protÃ¨gent pas les images.
- L'inclinaison du tÃ©lÃ©phone est testÃ©e par Ã©vÃ©nements simulÃ©s ; sensation et permissions sur appareil physique restent Ã  vÃ©rifier.
- La couverture mobile a Ã©tÃ© contrÃ´lÃ©e par simulation de repli de barre d'adresse, pas sur une barre Android/iOS physique.
- L'aurore WebGL reste animÃ©e avec rÃ©duction des mouvements ; la signature et Noces ont leurs propres adaptations.
