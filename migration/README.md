# Migration Firestore : repas et couchage

Migration appliquée dans Cloud Shell le 5 octobre 2026, avec succès confirmé par le propriétaire. Aucune nouvelle écriture n’est nécessaire pour ranger ces fichiers.

Ce dossier regroupe le script, ses tests et le fichier privé `firebase-invitation-flags.local.json` (ignoré par Git). `.env.local` reste à la racine du projet. Le script ajoute `participation_repas` et `couchage_sur_place` aux invitations ; il conserve les autres champs et les réponses individuelles dans `statuts`.

Depuis la racine du projet :

```sh
node --test migration/invitation-flags.test.mjs
node migration/update-invitation-flags.mjs --validate-only
# Lecture et aperçu uniquement, avec Google Cloud CLI connecté
node migration/update-invitation-flags.mjs
# Écriture explicite, seulement si une nouvelle mise à jour est voulue
node migration/update-invitation-flags.mjs --apply
```

Pour Cloud Shell, importer le script et le JSON privé dans le même dossier, puis exécuter `node update-invitation-flags.mjs --cloud-shell` depuis ce dossier. Ajouter `--apply` uniquement pour écrire. Le projet gcloud actif doit correspondre à la base voulue.

Les groupes de `sans_repas` ont les deux champs à `false`. Ceux de `sans_couchage` ont le couchage à `false`. Les autres invitations à code de six caractères ont les deux champs à `true`. Les champs existants identiques sont ignorés. Les effectifs affichés sont les effectifs prévus des groupes, pas les réponses confirmées.

Le dashboard admin lit les flags et affiche les ratios confirmés/invités pour le repas et le couchage. La confirmation les utilise aussi pour le vin d’honneur uniquement et les suggestions de logement extérieur. Le workflow ne lit plus les deux anciennes listes ; seule la liste d’affichage du formulaire RSVP reste dans l’environnement. [Procédure et contraintes](../docs/CONFIGURATION.md#initialiser-les-champs-repas-et-couchage).
