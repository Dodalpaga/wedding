# État actuel

Le site possède une landing mobile, un RSVP individuel modifiable, les suggestions d'hébergement, la page Noces (carnet de voyage Tokyo, Nara, Osaka, Okinawa avec deux transitions 3D et le lagon d'Okinawa) et un dashboard admin avec export CSV. Les galeries restent des prototypes. Programme et itinéraire japonais restent provisoires.

## Vérifications

`npm test` exécute les tests locaux du RSVP/CSV, des invitations et de la géométrie de décollage de la page Noces avec données fictives ; aucune écriture Firebase. TypeScript interdit les variables et paramètres inutilisés. Après la refonte de Noces, `npx tsc --noEmit`, `npm test` (15 tests) et `next build` passent.

## Page Noces

`/noces/` alterne sections washi et néon : couverture washi (ensō, monogramme, sceau), bandeau de noms, chapitre Tokyo sombre (aurore montée uniquement près de l'écran, kanji filaire, horloges Toulouse/Tokyo, quatre envies en défilement horizontal), chapitre Nara crème (carnet de huit tampons dont daims et repas, plus un tampon « à inventer », trois mots), chapitre Osaka (enseigne néon, quatre envies culinaires animées, bandeau de plats), chapitre Okinawa au thème propre, lumineux et naturel (lagon turquoise puis plage de sable, quatre cartes postales au trait : plongée, récifs, tortues, couchant) et lettre chiffonnée tamponnée, qui occupe exactement un écran (lettre et liens côte à côte sur les écrans peu hauts, comme un téléphone en paysage). Tokyo, Nara, Osaka et Okinawa sont présentés comme des envies, sans dates ni horaires.

Les deux transitions sont des objets 3D intégrés à la page, sans décor (`Scene3D.tsx`, `scenes.ts`) :

- **Shinkansen (Tokyo → Nara).** Un N700 (deux motrices dos à dos) traverse l'écran. Une ficelle de longueur fixe attachée à sa queue pend d'abord, puis, tendue, traîne le coin supérieur droit de l'« autocollant » sombre de Tokyo derrière le train, dans l'axe de la ficelle (tractrice recalculée à chaque image, identique dans les deux sens de scroll). `peel.ts` replie le coin le long de la médiatrice entre sa position d'origine et le point tiré : la page est découpée en conséquence et le rabat (dos crème dégradé, ombre portée) est dessiné en SVG. L'autocollant décollé découvre directement l'introduction du chapitre Nara.
- **Torii (Nara → Osaka).** Un torii en bois flanqué de deux lanternes se dresse sur le papier avec son ombre portée. L'introduction du chapitre Osaka apparaît dans son ouverture : la découpe est projetée depuis le modèle, son haut passe derrière la traverse basse (mesurée par lancer de rayons en ignorant la corde) et ses côtés derrière les piliers. Elle remplit l'écran quand on passe dessous ; les textes du chapitre n'apparaissent qu'une fois le passage entièrement ouvert.

- **Lagon (Osaka → Okinawa).** Pas de transition épinglée : le chapitre Okinawa s'ouvre directement sur la surface du lagon (`OkinawaLagoon.tsx`). Deux vagues d'arrière-plan `react-wavify` ondulent derrière ; la vague de premier plan, invisible, sert de forme : son tracé, recopié à chaque image, découpe le calque « eau » (`clip-path`), qui forme d'un seul tenant la vague et l'eau dessous. Dans l'eau, une photo de récif vue depuis la surface (Jeffry Surianto, Pexels, créditée sur la page), légèrement floutée (eau un peu trouble) et déformée par des caustiques (shader `Water`), sous une teinte lagon qui fonce vers le bas pour la lisibilité du texte ; au-dessus, net, un second shader `Water` sans image dessine les reflets blancs de la surface, et des rayons de soleil (shader `GodRays`) de `@paper-design/shaders-react`, animés avec du bruit, des bulles et le kanji 沖縄 ; les shaders se mettent en pause hors écran. Une ligne d'écume fait ensuite le rivage vers les envies, sur fond de sable.

Canvas transparent, éclairage d'environnement, ombres sur plan invisible, progression lissée. Three.js et les modèles (environ 1,9 Mo) ne sont chargés qu'à l'approche ; le rendu n'a lieu que pendant le scroll et s'arrête hors écran. La page masque sa barre de défilement (le défilement reste possible). Avec `prefers-reduced-motion`, les chapitres révélés s'affichent directement, sans épinglage ni 3D.

L'ancien parcours (globe MapLibre Toulouse–Tokyo, vidéo YouTube, visite Inakaya, carrousel de souvenirs, carte Kinkakuji), ses modèles, ses tests et la dépendance `maplibre-gl` ont été retirés, ainsi que les concepts intermédiaires (pages de test, vidéos Pexels, rideau 3D).

Vérifié sur 1920×1080, 1366×768, 1280×800, 768×1024, 375×812, 375×667 et 812×375, sans débordement horizontal.

## Limites connues

Le mode édition global modifie les réponses RSVP, les présences, l'e-mail et les commentaires des invités visibles sur la page ; les changements se sauvegardent en un lot Firestore ou s'annulent. Les cartes mobiles et les statistiques du tableau ont été resserrées pour limiter le défilement. Aucune réponse réelle n'a été écrite ; les règles Firestore de l'admin restent à sécuriser séparément.

- Les règles Firebase et rôles admin ne sont pas dans le dépôt ; les codes/conditions client ne constituent pas une protection serveur.
- Les galeries ne valident pas les invitations et ne protègent pas les images.
- Les transitions 3D de Noces n'ont pas été mesurées sur un vrai téléphone, ni testées avec la réduction des mouvements activée ; les glyphes japonais dépendent des polices système (Yu, Hiragino, Noto).
- L'aurore WebGL reste animée avec réduction des mouvements ; la signature et Noces ont leurs propres adaptations.
