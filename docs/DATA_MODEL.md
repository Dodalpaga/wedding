# Données et parcours RSVP

Schéma déduit du code client, au 3 octobre 2026. Il n’y a pas de schéma serveur ou de règles Firestore versionnés dans le dépôt.

## `codes_invitation/{CODE}`

L’identifiant du document est le code lui-même, utilisé en majuscules par la confirmation. L’admin et le compteur ne prennent en compte que les identifiants de **six caractères** avec un tableau `membres`. La vérification d’existence sur la page de confirmation ne vérifie pas cette longueur.

| Champ | Usage actuel |
| --- | --- |
| `membres: string[]` | Noms des invités ; une réponse est saisie par personne. |
| `message: string` | Texte personnalisé affiché sur la confirmation, retours à la ligne conservés. |
| `description?: string` | Description chargée par l’admin ; le code sert de fallback. |
| `date_utilisation?: Timestamp` | Mis à jour à chaque sauvegarde RSVP ; ne bloque pas une nouvelle réponse. |
| `participation_repas?: boolean` | Invitation du groupe au repas ; affichée pour chaque membre dans l’admin. |
| `couchage_sur_place?: boolean` | Couchage prévu pour le groupe sur place ; affiché pour chaque membre dans l’admin. |

Exemple fictif de document **ABCDEF** :

```json
{
  "membres": ["Invité Exemple A", "Invité Exemple B"],
  "message": "Nous vous attendons pour célébrer ce beau week-end ensemble.",
  "description": "Cercle exemple"
}
```

Les anciens champs d’exemple `max_accompagnants`, `utilise`, `type` et une collection `confirmations` ne correspondent pas au parcours implémenté. Le formulaire ne crée pas librement de nouveaux accompagnants : il utilise les membres prévus dans l’invitation.

### Organisation de groupe : repas et couchage

Le script `migration/update-invitation-flags.mjs` peut ajouter deux booléens à chaque invitation : `participation_repas` et `couchage_sur_place`. Ils décrivent les effectifs prévus pour **tout le groupe**, indépendamment des réponses individuelles. Un champ absent reste non renseigné. Un groupe sans repas est également sans couchage sur place.

Les effectifs prévus additionnent la taille de `membres` des groupes concernés. Ils ne sont pas des présences confirmées. La collection `statuts` conserve le RSVP individuel.

Dans le dashboard admin, chaque ratio est `nombre de membres avec statut accepte et flag true / nombre de membres avec flag true`. Refusés et réponses en attente restent dans le dénominateur, mais pas dans le numérateur. Les cases des événements du week-end ne conditionnent pas ces deux ratios : la confirmation signifie ici `statut: accepte`. Les indicateurs sont globaux, indépendants des filtres et de la pagination. Les flags absents ou invalides s’affichent « Non renseigné », sont exclus du ratio concerné et signalés à côté de l’indicateur. Le CSV conserve ses neuf colonnes.

**Migration appliquée dans Cloud Shell, avec succès confirmé par le propriétaire le 5 octobre 2026.** La confirmation lit désormais `participation_repas === false` pour le vin d’honneur uniquement, et `couchage_sur_place === false` pour afficher les suggestions de logement extérieur. Les invités sans repas et sans couchage voient donc aussi le lien « Où dormir ? ». Les champs absents ou invalides ne sont pas assimilés à `false` : pas de badge vin d’honneur ni de lien d’hébergement, et aucun fallback sur l’environnement. Le formulaire RSVP conserve ses choix d’événements par défaut dans ce cas. Voir [la procédure](CONFIGURATION.md#initialiser-les-champs-repas-et-couchage).

## `statuts/{nom_membre}`

Le nom exact du membre est l’identifiant du document. Le RSVP le retrouve par identifiant ; l’admin et le compteur utilisent `nom_membre` pour leurs jointures.

| Champ | Valeur écrite |
| --- | --- |
| `code_invitation` | Code de l’invitation courante. |
| `nom_membre` | Nom choisi parmi les membres. |
| `statut` | `accepte` ou `refuse`. L’absence de réponse s’affiche comme `en_attente`. |
| `email` | Chaîne, facultative, vide autorisé. |
| `commentaires` | Chaîne pour allergies, besoins ou précisions. |
| `vendredi_soir` | Booléen. |
| `samedi_soir` | Booléen. |
| `dimanche_brunch` | Booléen. |
| `date_modification` | `serverTimestamp()` lors de la sauvegarde. |

Le schéma n’a pas de champ `samedi_midi`. Le CSV utilise neuf colonnes alignées : code, nom, statut, email, vendredi soir, samedi soir, dimanche brunch, commentaires et date. Tous les champs sont entourés de guillemets et les guillemets internes doublés. Les séquences de retours à la ligne CR/LF dans les champs, notamment les commentaires, sont remplacées par un espace **dans l’export uniquement** pour garantir une ligne physique par invité. Les textes dans Firestore et dans le dashboard restent inchangés. Le CSV utilise un BOM UTF-8 et des séparateurs de lignes CRLF. Les événements exportés sont les valeurs enregistrées ; le panneau et ses totaux ne comptent des présences que pour les invités confirmés.

Les noms doivent rester uniques entre les invitations : deux personnes portant exactement le même nom partagent sinon le même document de statut. Les noms utilisés comme identifiants Firestore ne doivent pas comporter de `/`. Ce sont des contraintes du modèle actuel, pas des validations ajoutées par cette documentation.

## Affichage selon l’invitation

| Source | Effet dans la confirmation |
| --- | --- |
| `NEXT_PUBLIC_CODES_RSVP` | Affiche le formulaire de réponse. |
| Firestore : `couchage_sur_place === false` | Affiche le lien vers les suggestions de logement extérieur. |
| Firestore : `participation_repas === false` | Affiche le badge cérémonie/vin d’honneur et masque les cases d’événements du week-end. |

Un code présent dans Firestore mais absent de la liste RSVP peut afficher son message sans formulaire. Une invitation au vin d’honneur doit aussi être dans la liste RSVP pour permettre sa réponse. Le lien d’hébergement propose des logements extérieurs ; le message Firestore peut préciser l’organisation prévue. La route d’hébergement reste ouverte directement. Les deux anciennes listes d’environnement sont remplacées et ne sont plus lues ni injectées dans le build.

## Lecture et écriture

1. Landing : suppression des espaces autour du code puis URL encodée vers la confirmation.
2. Confirmation : normalisation en majuscules et `getDoc` sur l’invitation.
3. Formulaire : nouvelle lecture des membres et écoute de toute la collection `statuts`.
4. Sélection d’un membre : préremplissage de sa réponse, ou attente avec statut de formulaire par défaut `accepte`.
5. Acceptation week-end : au moins une case d’événement doit être sélectionnée. Refus/vin d’honneur : cette validation ne s’applique pas.
6. Sauvegarde : `setDoc` du statut complet, puis `updateDoc` de `date_utilisation` sur l’invitation. Les deux opérations ne sont pas une transaction/batch ; une erreur de la seconde n’annule pas la première.
7. Le succès s’affiche puis la sélection et le formulaire sont réinitialisés après six secondes. Une sélection ultérieure permet de modifier la réponse.

L’email et les commentaires sont optionnels. Les événements masqués ne sont pas automatiquement effacés dans la sauvegarde : les booléens du state sont écrits tels quels. Une modification du statut ne doit donc pas être supposée remettre ces valeurs à zéro.

## Confidentialité et vérification

Les noms, emails, commentaires et exports CSV sont des données d’invités. Ne pas les ajouter à Git ou aux captures de documentation. Les listes publiques et la connaissance d’un code ne remplacent pas les règles Firestore. Les tests déjà réalisés ont lu des invitations et modifié uniquement l’état local des formulaires, sans soumettre de réponses dans la base réelle.
