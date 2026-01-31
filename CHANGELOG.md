# Changelog - Mise à jour du 2024

## Nouvelles fonctionnalités

### 1. Calcul automatique de la balance du budget

**Problème résolu:** Lorsqu'une transaction était créée, mise à jour ou supprimée, la balance du budget (`total_amount`) n'était pas automatiquement mise à jour.

**Solution implémentée:**

- Le backend calcule maintenant automatiquement la balance du budget à chaque opération sur une transaction
- Les transactions de type `income` (revenus) augmentent la balance du budget
- Les transactions de type `expense` (dépenses) diminuent la balance du budget

**Fichiers modifiés:**

- `backend/app/api/transactions.py`:
  - `create_transaction`: Met à jour le budget lors de la création
  - `update_transaction`: Annule l'ancienne transaction et applique la nouvelle
  - `delete_transaction`: Annule la transaction avant suppression

### 2. Paramétrage de la devise par utilisateur

**Problème résolu:** La devise était codée en dur à `EUR` dans toute l'application.

**Solution implémentée:**

- Ajout d'un nouveau champ `preferred_currency` dans le profil utilisateur
- Cette devise est utilisée par défaut pour toutes les nouvelles opérations (budgets, transactions)
- L'utilisateur peut changer sa devise préférée dans les paramètres de profil

**Fichiers modifiés:**

#### Backend

- `backend/alembic/versions/e706b19a6596_add_preferred_currency_to_user.py`: Migration de base de données
- `backend/app/models/user.py`: Ajout du champ `preferred_currency`
- `backend/app/schemas/user.py`: Ajout de `preferred_currency` dans `UserBase` et `UserUpdate`
- `backend/app/api/users.py`: Gestion de la mise à jour de la devise préférée

#### Frontend

- `frontend/src/services/auth.ts`: Ajout de `preferred_currency` à l'interface `User`
- `frontend/src/stores/auth.ts`: Ajout de la propriété computed `preferredCurrency`
- `frontend/src/views/ProfileView.vue`: Ajout d'un sélecteur de devise (8 devises disponibles)
- `frontend/src/views/BudgetsView.vue`: Utilisation de la devise préférée par défaut
- `frontend/src/views/BudgetDetailView.vue`: Import du store d'authentification

## Devises supportées

- EUR (Euro)
- USD (Dollar américain)
- GBP (Livre sterling)
- XOF (Franc CFA)
- CAD (Dollar canadien)
- CHF (Franc suisse)
- JPY (Yen japonais)
- CNY (Yuan chinois)

## Comment tester

### Test 1: Calcul automatique de la balance

1. Connectez-vous à l'application
2. Créez ou sélectionnez un budget existant
3. Notez la balance actuelle du budget
4. Créez une transaction de type "Income" (revenu) de 100€
   - La balance du budget devrait augmenter de 100€
5. Créez une transaction de type "Expense" (dépense) de 50€
   - La balance du budget devrait diminuer de 50€
6. Modifiez une transaction existante
   - La balance devrait être ajustée correctement
7. Supprimez une transaction
   - La balance devrait être recalculée sans cette transaction

### Test 2: Devise préférée

1. Allez dans les paramètres du profil (icône utilisateur en haut à droite)
2. Changez la devise préférée (ex: USD au lieu de EUR)
3. Cliquez sur "Update Profile"
4. Créez un nouveau budget
   - Le champ "Currency" devrait être pré-rempli avec USD
5. Vérifiez que les montants sont affichés avec le bon symbole ($)

## Notes techniques

### Migration de base de données

La migration a déjà été appliquée. Si vous devez la réappliquer :

```bash
docker-compose exec backend alembic upgrade head
```

### Redémarrage des services

Si les modifications ne sont pas visibles, redémarrez les services :

```bash
# Backend
docker-compose restart backend

# Frontend (si lancé manuellement)
cd frontend
npm run dev
```

## URLs des services

- Frontend: http://localhost:5174
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Base de données: localhost:5433

## Prochaines améliorations possibles

- Ajouter plus de devises
- Permettre la conversion entre devises
- Historique des changements de balance
- Notifications lors des transactions importantes
- Export des transactions en CSV avec la devise appropriée
