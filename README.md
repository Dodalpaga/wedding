# 💍 Site de Mariage - Solenne & Dorian

Site web de mariage avec système de gestion d'invitations via Firebase.

## 🌟 Fonctionnalités

- ✨ Design élégant avec thème aurores boréales
- 🎟️ Système de codes d'invitation uniques
- 📋 Formulaire de confirmation avec gestion des accompagnants
- 📊 Dashboard admin pour suivre les réponses
- 📤 Export CSV des confirmations
- 🔒 Sécurisé avec Firebase Authentication & Firestore
- 📱 100% Responsive (mobile, tablette, desktop)

## 🛠️ Technologies

- **Framework** : Next.js 14 (React)
- **Styling** : Tailwind CSS
- **Backend** : Firebase (Firestore + Authentication)
- **Déploiement** : GitHub Pages / Vercel
- **Langage** : TypeScript

## 📦 Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo

# 2. Installer les dépendances
npm install

# 3. Configurer Firebase
# Créez un fichier .env.local avec vos clés Firebase
# (Voir .env.local.example pour le template)

# 4. Lancer en développement
npm run dev
```

## ⚙️ Configuration

### 1. Firebase

Créez un projet Firebase et activez :

- Firestore Database
- Authentication (Email/Password)

Puis créez `.env.local` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_clé
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2. Règles Firestore

Dans Firebase Console → Firestore → Règles

### 3. Créer un compte admin

Firebase Console → Authentication → Users → Add user

Email : `admin@mariage-sd.com`
Password : `VotreMotDePasse123!`

## 🚀 Déploiement

### GitHub Pages

1. Modifiez `next.config.js` avec le nom de votre repo
2. Ajoutez vos secrets Firebase dans GitHub (Settings → Secrets)
3. Push vers GitHub
4. Le déploiement se fait automatiquement via GitHub Actions

### Vercel (Alternative)

1. Importez votre repo sur Vercel
2. Ajoutez les variables d'environnement
3. Déployez !

## 📱 URLs

**Développement :**

- Site principal : http://localhost:3000
- Confirmation : http://localhost:3000/confirmation
- Admin : http://localhost:3000/admin

**Production :**

- Site : https://votre-username.github.io/votre-repo
- Confirmation : https://votre-username.github.io/votre-repo/confirmation
- Admin : https://votre-username.github.io/votre-repo/admin

## 📋 Structure du Projet

```
├── app/
│   ├── page.tsx                  # Page d'accueil
│   ├── confirmation/
│   │   └── page.tsx             # Formulaire avec code
│   └── admin/
│       └── page.tsx             # Dashboard admin
├── components/
│   ├── Header.tsx               # Navigation
│   ├── Hero.tsx                 # Section hero
│   ├── InfoSection.tsx          # Infos pratiques
│   ├── Accommodation.tsx        # Hébergements
│   ├── Footer.tsx               # Pied de page
│   ├── InvitationLogin.tsx      # Login avec code
│   └── RSVPFormFirebase.tsx     # Formulaire Firebase
├── lib/
│   └── firebase.ts              # Config Firebase
└── .env.local                   # Variables (non committé)
```

## 🎯 Utilisation

### Créer des codes d'invitation

Dans Firestore, collection `codes_invitation` :

```javascript
{
  code: "FAM-MARTIN-2027",
  nom: "Famille Martin",
  email: "martin@email.com",
  max_accompagnants: 4,
  type: "moi",
  utilise: false
}
```

### Dashboard Admin

Accédez à `/admin` avec vos identifiants pour :

- Voir les statistiques en temps réel
- Filtrer par statut/type
- Exporter en CSV
- Suivre les confirmations

## 📊 Collections Firestore

### `codes_invitation`

Stocke les codes d'invitation uniques.

### `confirmations`

Stocke les réponses des invités (créées automatiquement).

## 🔒 Sécurité

- ✅ Variables d'environnement pour les clés sensibles
- ✅ Authentification Firebase pour l'admin
- ✅ Règles Firestore pour protéger les données
- ✅ Codes d'invitation à usage unique
- ✅ .env.local dans .gitignore

## 📝 License

Projet personnel - Tous droits réservés

## 💕 Auteurs

Solenne & Dorian - Mariage du 17 Juillet 2027

---

**Fait avec ❤️ et Next.js**
