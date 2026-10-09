# Inclinaison du téléphone : carte Kinkakuji

Demande du 9 octobre 2026 : retrouver sur téléphone le mouvement 3D du survol PC, avec la position au chargement comme référence neutre.

- [x] Vérifier les contraintes des capteurs et permissions navigateur.
- [x] Ajouter une référence relative, portrait/paysage, bornage et lissage, sans dessin hors écran/onglet masqué.
- [x] Garder survol/clavier, réduction des mouvements et bouton de recentrage ; demander l'autorisation par un bouton uniquement sur les navigateurs qui l'exigent.
- [x] Tester calculs, événements capteur, autorisation/refus, responsive et absence de rendu au repos.
- [x] TypeScript, export, documentation et limites de vérification.

La première mesure valide est la référence, au chargement lorsque l'accès est automatique ; après activation lorsque le navigateur interdit toute mesure sans autorisation. Un changement portrait/paysage recapture la référence. Aucun déploiement ni écriture Firebase.

Validation : cinq tests couvrent le calcul relatif, les discontinuités angulaires, le bornage, les événements, le neutre pendant la préparation, le recentrage, le bruit, les permissions et leurs refus, le démontage, les préférences de mouvement et l'arrêt hors écran/onglet masqué. TypeScript et export statique isolé réussis. Le navigateur vérifie le clavier/reset existants et les mises en page à 320×568, 820×1180 et 1280×720. Le navigateur de bureau ne simule pas un vrai capteur de téléphone : l'autorisation iOS et la sensation sur appareil physique restent à vérifier. Les mesures capteur sont simulées uniquement dans les tests unitaires ; aucun événement fictif n'est envoyé dans la page réelle.
