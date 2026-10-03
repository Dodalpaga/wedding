# Admin : CSV et présentation

## Objectif
Corriger les cellules CSV multilignes et le décalage des colonnes ; harmoniser le panneau admin avec la palette du mariage et rendre la consultation pratique sur PC/tablette/téléphone.

## Étapes
- [x] Lire le code, les docs et la capture admin.png.
- [x] Extraire un export CSV testé (guillemets, séparateurs, retours à la ligne, accents, colonnes).
- [x] Séparer la présentation admin du chargement Firebase pour vérifier le layout avec des données fictives.
- [x] Harmoniser couleurs, statistiques, filtres, tri clavier et pagination ; conserver export des résultats filtrés.
- [x] Vérifier connexion et interface sans écrire dans Firebase ; tests, types et export statique.
- [x] Synchroniser la documentation et terminer le plan.

## Résultat
Trois tests CSV passent, TypeScript passe et la construction/export statique génère 11 pages. Interface vérifiée avec 43 invités fictifs à 320/390/820/1024/1440px : filtres, pagination, tri clavier, commentaires, état vide et absence de débordement de page. La connexion est vérifiée visuellement sans authentification réelle. Le navigateur de test ne capture pas le téléchargement ; le contenu CSV est contrôlé par les tests ciblés. Aucune écriture de données invitées. Les captures livrées utilisent uniquement les fixtures. La route de fixture a été retirée avant le build de production.
