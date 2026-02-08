# County Mobile - Application de Gestion de Budget

Application mobile React Native pour la gestion de budget personnel, construite avec Expo et connectée à l'API County.

## 📱 Fonctionnalités

- **Authentification** : Connexion/Inscription sécurisée avec tokens JWT
- **Dashboard** : Vue d'ensemble de vos finances avec KPIs et graphiques
- **Budgets** : Création et gestion de plusieurs budgets
- **Transactions** : Suivi des revenus et dépenses avec pagination
- **Catégories** : Organisation des transactions par catégorie personnalisée
- **Profil** : Gestion du compte utilisateur

## 🛠️ Technologies

- **Framework** : React Native 0.81.5 avec Expo SDK 54
- **Language** : TypeScript 5.9
- **Navigation** : React Navigation 7
- **State Management** : Zustand 5
- **HTTP Client** : Axios 1.12
- **Styling** : StyleSheet natif avec thème personnalisé
- **Secure Storage** : Expo Secure Store

## 📦 Prérequis

- Node.js 20+ ou 22+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Pour iOS : Xcode (macOS uniquement)
- Pour Android : Android Studio

## 🚀 Installation

```bash
# Naviguer vers le dossier mobile
cd mobile

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

## 📱 Lancement

```bash
# iOS (macOS uniquement)
npm run ios

# Android
npm run android

# Web
npm run web
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `mobile` :

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Pour le développement mobile local, remplacez `localhost` par l'IP de votre machine.

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Vérification TypeScript
npm run lint
```

## 📁 Structure du Projet

```
mobile/
├── App.tsx                 # Point d'entrée de l'application
├── app.json               # Configuration Expo
├── package.json           # Dépendances et scripts
├── tsconfig.json          # Configuration TypeScript
├── assets/                # Images et icônes
└── src/
    ├── components/        # Composants UI réutilisables
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── TextInput.tsx
    │   └── ...
    ├── navigation/        # Configuration de la navigation
    │   └── AppNavigator.tsx
    ├── screens/           # Écrans de l'application
    │   ├── DashboardScreen.tsx
    │   ├── BudgetsScreen.tsx
    │   ├── TransactionsScreen.tsx
    │   └── ...
    ├── services/          # Services API
    │   ├── api.ts
    │   ├── auth.ts
    │   └── ...
    ├── stores/            # State management (Zustand)
    │   ├── authStore.ts
    │   ├── budgetsStore.ts
    │   └── ...
    ├── theme/             # Thème et styles
    │   └── index.ts
    ├── types/             # Types TypeScript
    │   └── index.ts
    └── utils/             # Fonctions utilitaires
        └── index.ts
```

## 🎨 Design

L'application utilise un design moderne et sombre avec :
- Palette de couleurs cohérente (primary, neutral, success, danger)
- Composants glassmorphism
- Animations fluides
- Interface intuitive et accessible

## 📖 Endpoints API

L'application se connecte aux endpoints suivants de l'API County :

| Endpoint | Description |
|----------|-------------|
| `/auth/login` | Connexion |
| `/auth/register` | Inscription |
| `/auth/refresh` | Rafraîchissement du token |
| `/users/me` | Profil utilisateur |
| `/budgets` | Gestion des budgets |
| `/categories` | Gestion des catégories |
| `/transactions` | Gestion des transactions |

## 🔐 Sécurité

- Les tokens JWT sont stockés de manière sécurisée avec Expo Secure Store
- Rafraîchissement automatique des tokens expirés
- Validation des entrées utilisateur côté client

## 📄 Licence

MIT
