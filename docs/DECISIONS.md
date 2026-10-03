# Décisions

Référence actuelle : 3 octobre 2026. Ce fichier distingue les choix en vigueur des propositions remplacées pendant les ajustements visuels.

## Choix en vigueur

### Site statique et données client

Conserver Next.js App Router avec export statique GitHub Pages sous `/wedding`. Les invitations et statuts restent dans Firestore, avec Authentication pour la connexion admin. Les règles effectives Firebase ne sont pas versionnées ; ne pas déduire la sécurité du seul affichage client.

### Accès rapide aux informations

La landing donne accès au RSVP et aux informations depuis le hero. Les invités passent par leur code pour ouvrir l’invitation, puis répondent individuellement. Les détails secondaires utilisent des disclosures natifs pour limiter le défilement. Deux panneaux ont une hauteur égale dès 768px ; sur téléphone, RSVP puis informations s’empilent. La carte du voyage est visible avant les FAQ.

L’action du code s’appelle « Accéder à mon invitation », car elle ne sauvegarde pas une réponse. Le programme précise que les événements accessibles dépendent de l’invitation. Conserver l’échéance du 31 décembre 2026 et le programme provisoire sans inventer de nouveaux horaires.

### Identité visuelle préservée

Le hero remplit au minimum le viewport sur téléphone, tablette et PC, avec un lien de défilement dans le flux et une croissance naturelle sur les écrans courts. Conserver l’aurore initiale (blend 0.4, amplitude 0.7, speed 0.2), ses couleurs au breakpoint de 1000px et son dégradé diagonal. Le logo reprend 50 % de largeur jusqu’à 240px ; les noms prennent pleine largeur jusqu’à 672px. `domaine.svg` garde son ratio, sans recadrage. Les particules ne sont pas remontées.

Le countdown est simplifié à un nombre de jours, recalculé chaque minute, avec offset horaire français explicite. Les styles de réduction des mouvements concernent la signature/CSS ; ils ne suspendent pas actuellement le canvas Aurora.

### RSVP plus compact sur les grands écrans

Deux colonnes dès 768px pour les champs réponse/email et les cartes d’événements, titres/icônes plus petits, marges réduites, cartes d’invités en auto-fit. Email facultatif conformément au libellé, commentaires associés à leur label. Le mécanisme de sauvegarde Firestore reste celui existant.

### Contact par e-mail

Ne pas afficher les numéros personnels de Solenne et Dorian. Landing et aide en cas d’erreur de confirmation proposent un bouton `mailto:` aux deux mariés. Les coordonnées publiques des établissements d’hébergement restent distinctes.

### Voyage de noces encore en préparation

Présenter un roadtrip d’un mois au Japon. Conserver les cinq destinations envisagées comme exemples modifiables, sans plages de jours définitives. Chaque escale dispose d’un titre, texte provisoire et envies. Les visuels SVG locaux remplacent les images cassées et services externes de placeholder ; une image locale optionnelle peut ensuite être ajoutée. Préserver l’avion au défilement et l’alternance desktop ; respecter `useReducedMotion`. Le bouton Accueil appartient à la bannière. La participation reste une urne au mariage, sans paiement en ligne.

### Galeries non annoncées comme prêtes

La landing indique « bientôt disponible ». Les deux routes de prototype existent mais leurs contrôles de code ne valident pas Firestore. La galerie OneDrive garde des liens à compléter et des nombres de photos d’exemple.

## Choix remplacés

- Le premier refactoring proposait un hero compact sur téléphone : remplacé par un hero plein écran sur toutes les tailles à la demande des propriétaires.
- Le fond statique proposé au début a été remplacé par l’aurore d’origine.
- Le logo et les noms initialement réduits ont retrouvé leurs proportions d’origine.
- L’ancienne page voyage évoquait trois semaines et des étapes datées : remplacée par un mois et des escales provisoires.

Les plans terminés documentent les vérifications de chaque étape. Les anciennes captures ne représentent pas nécessairement les paramètres actuellement en vigueur.
