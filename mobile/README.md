# County Mobile

Application mobile React Native pour la gestion de budget personnel, développée avec Expo et TypeScript.

## Fonctionnalités

- **Authentification** : Connexion/inscription sécurisée avec JWT
- **Dashboard** : Vue d'ensemble des finances avec statistiques et graphiques
- **Budgets** : Création et gestion de budgets multiples
- **Transactions** : Suivi des revenus et dépenses avec pagination
- **Catégories** : Organisation des transactions par catégories personnalisées
- **Profil** : Gestion du compte utilisateur

## Technologies

- **Framework** : React Native 0.81 avec Expo SDK 54
- **Langage** : TypeScript 5.9
- **Navigation** : React Navigation 7
- **État global** : Zustand 5
- **HTTP Client** : Axios 1.12
- **Stockage sécurisé** : Expo Secure Store
- **Tests** : Jest + Testing Library

## Prérequis

- Node.js 20.19.0+ ou 22.12.0+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Application Expo Go sur votre appareil mobile (pour le développement)

## Installation

```bash
# Naviguer vers le dossier mobile
cd mobile

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre le serveur de développement Expo |
| `npm run android` | Lance l'app sur Android |
| `npm run ios` | Lance l'app sur iOS (macOS requis) |
| `npm run web` | Lance l'app dans le navigateur |
| `npm test` | Exécute les tests |
| `npm run type-check` | Vérifie les types TypeScript |

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `mobile` :

```env
EXPO_PUBLIC_API_URL=http://your-api-url/api/v1
```

Pour le développement local avec le backend :
- iOS Simulator : `http://localhost:8000/api/v1`
- Android Emulator : `http://10.0.2.2:8000/api/v1`
- Appareil physique : `http://your-local-ip:8000/api/v1`

## Structure du projet

```
mobile/
├── App.tsx                 # Point d'entrée
├── app.json                # Configuration Expo
├── package.json            # Dépendances
├── tsconfig.json           # Configuration TypeScript
├── jest.config.js          # Configuration tests
├── assets/                 # Images et ressources
└── src/
    ├── components/         # Composants réutilisables
    │   ├── Button.tsx
    │   ├── TextInput.tsx
    │   ├── Card.tsx
    │   └── ...
    ├── constants/          # Constantes (couleurs, spacing...)
    │   └── theme.ts
    ├── navigation/         # Configuration navigation
    │   ├── AuthNavigator.tsx
    │   ├── MainNavigator.tsx
    │   └── RootNavigator.tsx
    ├── screens/            # Écrans de l'application
    │   ├── LoginScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── BudgetsScreen.tsx
    │   └── ...
    ├── services/           # Services API
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── budgets.ts
    │   └── ...
    ├── stores/             # État global (Zustand)
    │   ├── authStore.ts
    │   ├── budgetsStore.ts
    │   └── ...
    ├── types/              # Types TypeScript
    │   └── index.ts
    └── utils/              # Utilitaires
        └── formatters.ts
```

## Design

L'application suit un design moderne avec :

- **Thème sombre** : Interface sombre pour réduire la fatigue oculaire
- **Couleurs** : 
  - Primaire : Bleu (#3B82F6)
  - Succès : Vert (#22C55E)
  - Erreur : Rouge (#EF4444)
- **Typographie** : Police système native
- **Animations** : Transitions fluides

## Connexion avec le Backend

L'application communique avec l'API REST du backend County. Assurez-vous que le backend est démarré et accessible.

### Endpoints utilisés

- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `POST /auth/refresh` - Rafraîchissement du token
- `GET /users/me` - Profil utilisateur
- `GET/POST/PUT/DELETE /budgets` - Gestion des budgets
- `GET/POST/PUT/DELETE /categories` - Gestion des catégories
- `GET/POST/PUT/DELETE /transactions` - Gestion des transactions

## Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture
npm test -- --coverage
```

## Build de production

Pour créer un build de production :

```bash
# Build pour Android (APK/AAB)
expo build:android

# Build pour iOS
expo build:ios

# Ou avec EAS Build (recommandé)
eas build --platform android
eas build --platform ios
```

## Contribution

1. Créez une branche depuis `main`
2. Faites vos modifications
3. Exécutez les tests
4. Soumettez une Pull Request

## License

MIT
