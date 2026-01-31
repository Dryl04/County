"""API URL routing for the County Budget API."""

from django.urls import path

from . import views

urlpatterns = [
    # Authentication
    path('auth/register', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login', views.LoginView.as_view(), name='auth-login'),
    path('auth/refresh', views.RefreshView.as_view(), name='auth-refresh'),
    path('auth/logout', views.LogoutView.as_view(), name='auth-logout'),

    # Users
    path('users/me', views.CurrentUserView.as_view(), name='user-me'),

    # Budgets
    path('budgets', views.BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<uuid:budget_id>', views.BudgetDetailView.as_view(), name='budget-detail'),

    # Categories
    path('categories', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<uuid:category_id>', views.CategoryDetailView.as_view(), name='category-detail'),

    # Transactions
    path('transactions', views.TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<uuid:transaction_id>', views.TransactionDetailView.as_view(), name='transaction-detail'),
]
