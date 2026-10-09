# Couverture du viewport mobile — 9 octobre 2026

La scène actuelle utilise `100lvh` au lieu de `100svh`, avec fallback `100vh` ; les translations Tokyo/Inakaya sont relatives à leur propre hauteur.

Contrôle navigateur de la CSS réelle avec une fixture de même structure (`.noces-page`, parcours, scène sticky et expériences). Les unités `svh` sont figées à la hauteur initiale, puis le viewport s'agrandit pour simuler le repli de la barre d'adresse.

| Scénario | Viewport visible | Bas de la scène | Fond découvert |
| --- | --- | --- | --- |
| Avant, téléphone 568 → 658 | 320×658 | 568px | 90px verts |
| Après, téléphone 568 → 658 | 320×658 | 658px | 0px |
| Après, expansion partielle | 320×600 | 600px | 0px |
| Après, retour à la hauteur initiale | 320×568 | 568px | 0px |
| Après, tablette 1180 → 1270 | 820×1270 | 1270px | 0px |
| Après, PC 900 → 990 | 1440×990 | 990px | 0px |

Mesures après défilement, lorsque la scène est sticky. `elementFromPoint` au dernier pixel visible appartient aux expériences après correction, au parcours vert avant correction. Aucun débordement horizontal dans les cas corrigés.

Fixture locale : `build/make-noces-viewport-fixture.cjs`, fichiers sous `build/globe-zoom-verify/out/viewport-check/` ; serveur `build/serve-globe-verify.cjs` (ignorés par Git). TypeScript et export statique isolé validés. Simulation sur navigateur de bureau, sans contrôle physique de la barre d'adresse Android/iOS ; les WebGL et les préférences de mouvement ne sont pas simulés dans cette fixture. Aucun accès ni écriture Firebase.
