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

Exemple fictif de document **ABCDEF** :

```json
{
  "membres": ["Invité Exemple A", "Invité Exemple B"],
  "message": "Nous vous attendons pour célébrer ce beau week-end ensemble.",
  "description": "Cercle exemple"
}
```

Les anciens champs d’exemple `max_accompagnants`, `utilise`, `type` et une collection `confirmations` ne correspondent pas au parcours implémenté. Le formulaire ne crée pas librement de nouveaux accompagnants : il utilise les membres prévus dans l’invitation.

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

Le schéma n’a pas de champ `samedi_midi`. Le CSV utilise neuf colonnes alignées : code, nom, statut, email, vendredi soir, samedi soir, dimanche brunch, commentaires et date. Tous les champs sont entourés de guillemets, les guillemets internes doublés et les retours à la ligne conservés dans les cellules. Il utilise un BOM UTF-8 et des séparateurs de lignes CRLF. Les événements exportés sont les valeurs enregistrées ; le panneau et ses totaux ne comptent des présences que pour les invités confirmés.

Les noms doivent rester uniques entre les invitations : deux personnes portant exactement le même nom partagent sinon le même document de statut. Les noms utilisés comme identifiants Firestore ne doivent pas comporter de `/`. Ce sont des contraintes du modèle actuel, pas des validations ajoutées par cette documentation.

## Catégories publiques

| Liste | Effet dans la confirmation |
| --- | --- |
| `NEXT_PUBLIC_CODES_RSVP` | Affiche le formulaire de réponse. |
| `NEXT_PUBLIC_CODES_AVEC_HEBERGEMENT` | Affiche le lien vers les suggestions de logement. |
| `NEXT_PUBLIC_CODES_VIN_HONNEUR` | Affiche le badge cérémonie/vin d’honneur et masque les cases d’événements du week-end. |

Ces listes peuvent se recouper. Un code présent dans Firestore mais absent de la liste RSVP peut afficher son message sans formulaire. Une invitation au vin d’honneur doit aussi être dans la liste RSVP pour permettre sa réponse. Le lien d’hébergement ne signifie pas qu’une chambre est réservée ; le message Firestore peut préciser l’organisation prévue. La route d’hébergement reste ouverte directement.

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
