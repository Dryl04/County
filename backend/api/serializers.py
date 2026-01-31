"""Django REST Framework serializers for the County Budget API."""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Budget, Category, Transaction, AuditLog

User = get_user_model()


# User Serializers
class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a user."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=100,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'preferred_currency']
        extra_kwargs = {
            'preferred_currency': {'required': False, 'default': 'EUR'}
        }

    def validate_password(self, value):
        """Validate password using Django's validators."""
        validate_password(value)
        return value

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            preferred_currency=validated_data.get('preferred_currency', 'EUR')
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a user."""

    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        max_length=100,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'preferred_currency']
        extra_kwargs = {
            'email': {'required': False},
            'full_name': {'required': False},
            'preferred_currency': {'required': False}
        }

    def validate_password(self, value):
        """Validate password using Django's validators."""
        if value:
            validate_password(value)
        return value

    def update(self, instance, validated_data):
        """Update and return user."""
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class UserResponseSerializer(serializers.ModelSerializer):
    """Serializer for user response."""

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'preferred_currency', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']


# Auth Serializers
class LoginRequestSerializer(serializers.Serializer):
    """Serializer for login request."""

    email = serializers.EmailField()
    password = serializers.CharField(min_length=1, style={'input_type': 'password'})


class TokenResponseSerializer(serializers.Serializer):
    """Serializer for token response."""

    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    token_type = serializers.CharField(default='bearer')


class RefreshTokenRequestSerializer(serializers.Serializer):
    """Serializer for refresh token request."""

    refresh_token = serializers.CharField()


# Budget Serializers
class BudgetCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a budget."""

    class Meta:
        model = Budget
        fields = ['name', 'description', 'total_amount', 'currency']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'total_amount': {'required': False, 'default': Decimal('0.00')},
            'currency': {'required': False, 'default': 'EUR'}
        }


class BudgetUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a budget."""

    class Meta:
        model = Budget
        fields = ['name', 'description', 'total_amount', 'currency']
        extra_kwargs = {
            'name': {'required': False},
            'description': {'required': False, 'allow_blank': True},
            'total_amount': {'required': False},
            'currency': {'required': False}
        }


class BudgetResponseSerializer(serializers.ModelSerializer):
    """Serializer for budget response."""

    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'user_id', 'name', 'description', 'total_amount', 'currency', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


# Category Serializers
class CategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a category."""

    budget_id = serializers.UUIDField()

    class Meta:
        model = Category
        fields = ['budget_id', 'name', 'color', 'icon']
        extra_kwargs = {
            'color': {'required': False, 'default': '#6366f1'},
            'icon': {'required': False, 'allow_blank': True}
        }

    def validate_color(self, value):
        """Validate hex color format."""
        import re
        if value and not re.match(r'^#[0-9a-fA-F]{6}$', value):
            raise serializers.ValidationError("Color must be a valid hex color (e.g., #6366f1)")
        return value


class CategoryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a category."""

    class Meta:
        model = Category
        fields = ['name', 'color', 'icon']
        extra_kwargs = {
            'name': {'required': False},
            'color': {'required': False},
            'icon': {'required': False, 'allow_blank': True}
        }

    def validate_color(self, value):
        """Validate hex color format."""
        import re
        if value and not re.match(r'^#[0-9a-fA-F]{6}$', value):
            raise serializers.ValidationError("Color must be a valid hex color (e.g., #6366f1)")
        return value


class CategoryResponseSerializer(serializers.ModelSerializer):
    """Serializer for category response."""

    budget_id = serializers.UUIDField(source='budget.id', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'budget_id', 'name', 'color', 'icon', 'created_at', 'updated_at']
        read_only_fields = ['id', 'budget_id', 'created_at', 'updated_at']


# Transaction Serializers
class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a transaction."""

    budget_id = serializers.UUIDField()
    category_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = ['budget_id', 'category_id', 'amount', 'currency', 'type', 'note', 'occurred_at']
        extra_kwargs = {
            'currency': {'required': False, 'default': 'EUR'},
            'note': {'required': False, 'allow_blank': True},
            'occurred_at': {'required': False}
        }

    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class TransactionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a transaction."""

    category_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = ['category_id', 'amount', 'currency', 'type', 'note', 'occurred_at']
        extra_kwargs = {
            'amount': {'required': False},
            'currency': {'required': False},
            'type': {'required': False},
            'note': {'required': False, 'allow_blank': True},
            'occurred_at': {'required': False}
        }

    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class TransactionResponseSerializer(serializers.ModelSerializer):
    """Serializer for transaction response."""

    budget_id = serializers.UUIDField(source='budget.id', read_only=True)
    category_id = serializers.UUIDField(source='category.id', read_only=True, allow_null=True)

    class Meta:
        model = Transaction
        fields = ['id', 'budget_id', 'category_id', 'amount', 'currency', 'type', 'note', 'occurred_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'budget_id', 'created_at', 'updated_at']


class TransactionListResponseSerializer(serializers.Serializer):
    """Serializer for paginated transaction list."""

    items = TransactionResponseSerializer(many=True)
    total = serializers.IntegerField()
    page = serializers.IntegerField()
    per_page = serializers.IntegerField()
    pages = serializers.IntegerField()
