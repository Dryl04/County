"""Django models for the County Budget API."""

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""

    def create_user(self, email, full_name, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for authentication and authorization."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, default='user')
    preferred_currency = models.CharField(max_length=3, default='EUR')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Budget(models.Model):
    """Budget model for tracking financial budgets."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets'

    def __str__(self):
        return self.name


class Category(models.Model):
    """Category model for transaction categorization."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name


class Transaction(models.Model):
    """Transaction model for tracking income and expenses."""

    class TransactionType(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='transactions',
        blank=True,
        null=True
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    note = models.CharField(max_length=500, blank=True, null=True)
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        indexes = [
            models.Index(fields=['budget', 'occurred_at']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.type} {self.amount}"


class AuditLog(models.Model):
    """Audit log model for tracking user actions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
        blank=True,
        null=True
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50, blank=True, null=True)
    resource_id = models.UUIDField(blank=True, null=True)
    payload = models.TextField(blank=True, null=True)  # JSON string
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'

    def __str__(self):
        return self.action
