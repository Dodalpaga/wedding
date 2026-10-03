# État du projet

État du code au **3 octobre 2026**. Ce document consolide les notes de refactoring ; les états intermédiaires sont conservés dans les plans/captures et ne sont pas la référence courante.

## Fonctionnalités actuelles

| Zone | État |
| --- | --- |
| Landing | Hero plein écran, aurore et proportions logo/noms d’origine, countdown en jours, ancres RSVP/infos. |
| Informations | RSVP en premier sur mobile, panneaux alignés dès 768px, domaine sans crop, programme/transport/conseils/FAQ repliables, compteur des invités confirmés. |
| Contact | Boutons e-mail sur la landing et l’erreur de confirmation ; aucun numéro personnel des mariés dans le code des pages. |
| Confirmation | Invitation Firestore, catégories configurées, réponse par membre et édition des réponses existantes. |
| RSVP | Layout compact sur tablette/PC, email facultatif, commentaires, événements selon catégorie et réponse. |
| Hébergement | Neuf suggestions locales filtrables ; coordonnées publiques des prestataires. |
| Voyage | Un mois au Japon, cinq escales envisagées, textes et visuels provisoires, avion animé, accès depuis la landing. |
| Admin | Connexion Firebase, statistiques, tri/recherche/filtres et export CSV ; limites ci-dessous. |
| Galeries | Prototypes existants, non proposés comme disponibles depuis la landing. |

Le programme détaillé du mariage et les villes/ordre/durées du Japon restent à finaliser avec les propriétaires. Les visuels du voyage peuvent être remplacés par des photos locales via `tripSteps.image`.

## Vérifications réalisées

- TypeScript a passé les contrôles après les refactorings et les derniers changements de lien/contact.
- Compilation de production et export statique réussis dans des copies propres, dont la version avec refactoring du voyage : 11 pages générées par Next. Les derniers petits changements lien/contact ont été contrôlés par TypeScript, sans nouveau build complet.
- Landing vérifiée à 320/375/390px, tablette portrait/paysage et PC 1440px : pas de débordement horizontal ; hero plein écran sur les tailles portrait et croissance sûre sur écran court/paysage ; panneaux de même hauteur même après expansion. Ces captures précèdent la restauration finale de taille logo/noms et de l’aurore.
- Trois catégories d’invitation réelles vérifiées en lecture : week-end avec logement réservé, week-end sans logement réservé, cérémonie/vin d’honneur. Les liens, badges et choix correspondent aux catégories ; la saisie de code en minuscules fonctionne.
- Acceptation week-end sans événement désactivée, sélection d’un événement activée, refus masquant les événements ; valeurs existantes chargées. Aucun clic de sauvegarde finale : aucun RSVP écrit pendant ces vérifications.
- Voyage vérifié à 320, 390, 820 et 1440px : absence de débordement, colonnes alternées sur tablette/PC, ancre d’itinéraire et avion progressant au scroll.
- Audit documentaire : README, consignes, docs, scripts, variables, schéma et routes confrontés au code. Aucun déploiement ni changement de données effectué.

Les contrôles UI ne valent pas validation de la persistance ou audit complet de sécurité. L’admin et les galeries n’ont pas fait l’objet d’un nouveau contrôle interactif pendant cette mise à jour documentaire. Voir [l’index des captures](screenshots/README.md) pour leur portée.

## Limites et incohérences connues

| Point | Observation dans le code |
| --- | --- |
| Modèle de membres | Le statut utilise le nom comme identifiant : collisions possibles entre homonymes, `/` non compatible avec cet identifiant. |
| Sauvegarde RSVP | Deux écritures séquentielles, sans transaction. Les événements masqués gardent leurs valeurs locales lors de l’écriture. |
| Accès Firebase/admin | Règles absentes du dépôt ; aucune définition de rôle admin dans le client. Leur configuration réelle n’a pas été auditée. Le compteur et RSVP lisent des collections entières. |
| Galeries | Présence d’un code dans l’URL seulement ; aucune validation d’invitation. Photos locales de démonstration, nombreux liens OneDrive et compteurs encore provisoires. |
| Images hébergements | Chemins `/wedding/hebergements/...` codés en dur : erreurs 404 observées en développement sans basePath. Le préfixe correspond à la production, sans établir que toutes les images de production ont été vérifiées. |
| Préchargement de police | Le layout utilise `/fonts/Wedding.otf` sans basePath ; vérifier le preload sous `/wedding`. La police des styles est aussi chargée via CSS. |
| Réduction des mouvements | Signature/CSS landing et animations du voyage prises en compte ; canvas Aurora encore animé. |
| Scripts npm | `export` utilise encore `next export` et `start` n’est pas adapté à l’export statique. Suite ciblée CSV disponible ; aucune configuration ESLint dédiée. |
| Outils de build | Avertissements Browserslist/Baseline obsolètes ; dépendances inchangées. `.next/trace` a été verrouillé lors de contrôles locaux, d’où les copies propres. |

Ces observations ont été documentées, sans correction applicative supplémentaire dans la tâche de documentation.

## Suite possible

Finaliser le programme, les escales et photos du Japon ; corriger les chemins d’assets ; définir/valider les règles d’accès Firebase avant toute affirmation de confidentialité ; terminer ou retirer les prototypes de galeries ; vérifier les sauvegardes sur une base de test. Les demandes de design actuelles et l’accès au voyage depuis la landing sont implémentés.

## Admin et CSV : correction

Export CSV corrigé : neuf colonnes alignées, email inclus, colonne samedi midi supprimée. Guillemets doublés et champs cités préservent les virgules/retours à la ligne ; BOM UTF-8 et lignes CRLF. Export de tous les résultats filtrés/triés, sans limiter à la page affichée. Trois tests de non-régression passent.

Panneau harmonisé bleu profond/vert, cartes statistiques, événements compacts, champs étiquetés, tri au clavier, pagination et cartes mobile/tablette. Les événements comptent seulement les confirmations, même si une ancienne réponse refusée garde ses cases cochées. Écoute Firebase unique avec nettoyage et erreurs visibles. Interface vérifiée avec 43 invités fictifs à 320, 390, 820, 1024 et 1440px : pas de débordement de page, filtres/réinitialisation, pages, état vide et lecture des commentaires vérifiés. Formulaire de connexion vérifié visuellement sans connexion à un compte réel. L’événement de téléchargement du navigateur de test n’a pas pu être capturé ; le contenu généré est validé par les tests CSV. Aucune réponse réelle ni donnée Firebase n’a été modifiée.

TypeScript et compilation/export de production validés dans une copie propre (11 pages). La route temporaire de prévisualisation fictive a été retirée avant la construction et ne fait pas partie du site livré. Les tests CSV se lancent avec `npm run test:csv`.
