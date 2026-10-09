# DonnÃ©es et RSVP

SchÃ©ma du client actuel. Les rÃ¨gles Firestore ne sont pas versionnÃ©es.

## Invitations : `codes_invitation/{CODE}`

La confirmation normalise le code en majuscules puis vÃ©rifie son existence. Le compteur et l'admin ne prennent en compte que les identifiants de six caractÃ¨res ayant un tableau `membres`.

| Champ | Usage |
| --- | --- |
| `membres: string[]` | Noms des invitÃ©s prÃ©vus, une rÃ©ponse par personne. |
| `message: string` | Message personnalisÃ©, retours Ã  la ligne conservÃ©s. |
| `description?: string` | Description admin ; fallback sur le code. |
| `date_utilisation?: Timestamp` | Horodatage de chaque sauvegarde, sans bloquer les modifications. |
| `participation_repas?: boolean` | Invitation du groupe au repas. |
| `couchage_sur_place?: boolean` | Couchage du groupe sur place. |

Les flags dÃ©crivent tout le groupe, indÃ©pendamment des rÃ©ponses. Seul `false` explicite active le badge vin d'honneur ou le lien vers les hÃ©bergements extÃ©rieurs ; absent/invalide signifie Â« Non renseignÃ© Â», sans fallback d'environnement. Les groupes sans repas sont aussi sans couchage. Le vin d'honneur masque les Ã©vÃ©nements dans le formulaire.

`NEXT_PUBLIC_CODES_RSVP` dÃ©termine uniquement l'affichage du formulaire. Un code existant mais absent de cette liste peut afficher son message sans RSVP. Cette prÃ©sentation n'est pas une autorisation serveur. [Maintenance des flags](CONFIGURATION.md#initialiser-les-champs-repas-et-couchage).

## RÃ©ponses : `statuts/{nom_membre}`

| Champ | Valeur |
| --- | --- |
| `code_invitation`, `nom_membre` | Code courant et nom exact du membre choisi. |
| `statut` | `accepte` ou `refuse` ; absence de rÃ©ponse affichÃ©e `en_attente`. |
| `email`, `commentaires` | ChaÃ®nes facultatives, vide autorisÃ©. |
| `vendredi_soir`, `samedi_soir`, `dimanche_brunch` | BoolÃ©ens d'Ã©vÃ©nements. |
| `date_modification` | `serverTimestamp()` Ã  la sauvegarde. |

Les noms doivent Ãªtre uniques entre invitations et ne pas contenir `/` : ils servent d'identifiants Firestore. Le formulaire utilise les membres prÃ©vus, sans crÃ©ation libre d'accompagnants. Aucun champ `samedi_midi`.

## Parcours et Ã©critures

1. La landing nettoie les espaces autour du code et encode l'URL de confirmation.
2. Le formulaire charge les membres et Ã©coute `statuts` ; choisir un membre prÃ©remplit sa rÃ©ponse.
3. Une acceptation week-end exige au moins un Ã©vÃ©nement ; cette validation ne concerne pas refus/vin d'honneur. Le statut initial du formulaire est `accepte`.
4. `setDoc` Ã©crit le statut complet, puis `updateDoc` horodate l'invitation. Ces opÃ©rations ne sont pas une transaction : une erreur de la seconde n'annule pas la premiÃ¨re.
5. AprÃ¨s succÃ¨s, la sÃ©lection/formulaire se rÃ©initialisent au bout de six secondes. La rÃ©ponse reste modifiable.

Les Ã©vÃ©nements masquÃ©s ne sont pas automatiquement effacÃ©s : les boolÃ©ens du state sont Ã©crits tels quels. Changer de statut ne remet pas implicitement ces valeurs Ã  zÃ©ro.

## Administration et CSV

Le dashboard joint les rÃ©ponses par `nom_membre`. Ratios repas/couchage : membres acceptÃ©s avec flag `true` / tous les membres avec flag `true`, indÃ©pendamment des Ã©vÃ©nements, filtres et pagination. Les flags manquants sont exclus du ratio et signalÃ©s.

Le CSV exporte tous les rÃ©sultats filtrÃ©s/triÃ©s, avec onze colonnes : Code, InvitÃ©, RÃ©ponse, Email, Vendredi, Samedi, Dimanche, Repas, Couchage sur place, Commentaires, Mise Ã  jour. RÃ©ponses : ConfirmÃ©/RefusÃ©/En attente. Ã‰vÃ©nements : Oui seulement si la rÃ©ponse est acceptÃ©e et la case cochÃ©e, sinon Â« â€” Â». Flags : Oui/Non/Non renseignÃ©, indÃ©pendamment du RSVP.

Chaque champ est entre guillemets, les guillemets internes sont doublÃ©s, et les CR/LF sont remplacÃ©s par un espace dans l'export uniquement. BOM UTF-8 et lignes CRLF ; email/date absents restent vides. La date franÃ§aise conserve annÃ©e et secondes. Les donnÃ©es Firestore ne sont pas rÃ©Ã©crites.

Ne pas ajouter noms, emails, commentaires, codes ou exports rÃ©els Ã  Git. VÃ©rifier les formulaires sans soumettre Ã  la base rÃ©elle ; la persistance exige une base de test ou une demande explicite appropriÃ©e.
