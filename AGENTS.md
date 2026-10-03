# Consignes du projet

## Contexte

Site de mariage en français, principalement consulté sur téléphone. Next.js 14 App Router avec export statique GitHub Pages ; Firestore et Firebase Authentication sont appelés depuis le navigateur. Le préfixe de production est `/wedding`, le développement n’a pas de préfixe.

## Documentation

La connaissance du projet est maintenue dans `/docs` :

- `docs/README.md` : index et carte de maintenance.
- `docs/ARCHITECTURE.md` : routes, composants, interactions et contraintes techniques.
- `docs/CONFIGURATION.md` : installation, environnement, scripts et déploiement.
- `docs/DATA_MODEL.md` : schéma Firestore, catégories d’invitation et comportement RSVP.
- `docs/DECISIONS.md` : décisions en vigueur et choix remplacés.
- `docs/PROJECT_STATE.md` : état actuel, vérifications et limites connues.
- `docs/plans/` : plans d’exécution ; `docs/screenshots/README.md` explique les captures.

Lire les documents utiles avant de modifier le comportement. Maintenir le README et ces documents en cohérence avec les changements significatifs. Pour une fonctionnalité complexe ou un refactoring majeur, créer un plan sous `docs/plans/active/`, l’actualiser au fil du travail puis le déplacer sous `docs/plans/completed/`. Les plans terminés restent historiques ; signaler les décisions remplacées plutôt que de les présenter comme actuelles.

## Règles de modification

- Privilégier la lisibilité mobile ; vérifier aussi tablette/PC lorsqu’une mise en page change.
- Conserver le hero plein écran, avec croissance naturelle sur les écrans courts.
- Conserver l’aurore d’origine : blend 0.4, amplitude 0.7, speed 0.2 ; couleurs `#1c7743`, `#003b4e` sous 1000px et `#003b4e`, `#1c7743`, `#003b4e` au-delà.
- Conserver le logo à 50 % de largeur, plafonné à 240px, et la signature à pleine largeur, plafonnée à 672px. Afficher `domaine.svg` entier à son ratio d’origine.
- Utiliser le contact e-mail ; ne pas réintroduire les numéros personnels des mariés. Les coordonnées publiques des hébergements sont distinctes.
- Le programme du mariage et les escales du Japon sont provisoires ; ne pas inventer d’horaires ou figer l’itinéraire.
- Utiliser Next Link/router pour les routes internes et `NEXT_PUBLIC_BASE_PATH` pour les assets publics lorsque nécessaire. Ne pas renommer les routes `gallerie` sans traiter leurs références.
- Préserver les champs et le comportement RSVP hors changement explicitement demandé. Les réponses sont modifiables, individuelles et stockées dans `statuts`.
- Ne pas publier `.env.local`, de vrais codes, données d’invités ou exports administratifs. Ne pas recopier de valeurs d’environnement dans les journaux/documentations.
- Vérifier les parcours sans soumettre de réponse dans la base réelle. Une vérification de persistance nécessite une base de test ou une demande explicite appropriée.
- Ne pas présenter les catégories de codes côté client ou l’écran de connexion admin comme une preuve de contrôle d’accès serveur ; les règles Firebase ne sont pas dans le dépôt.

## Vérifications

Après modification de code, utiliser les contrôles adaptés : `npx tsc --noEmit`, puis `npm run build` pour les changements significatifs. Ne pas utiliser `npm run export` : Next.js 14 exporte déjà via `output: 'export'`. Éviter de construire et de prévisualiser simultanément dans le même `.next`.

Pour le responsive, couvrir au minimum un petit téléphone, une tablette et un PC ; vérifier les débordements, liens, formulaires et accès clavier concernés. Respecter les préférences de réduction des mouvements. Documenter les limites de vérification et les données qui n’ont pas été écrites. Pour une modification purement documentaire, contrôler les liens, chemins, commandes et concordance avec le code sans reconstruire inutilement l’application.
