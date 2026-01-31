"""Pytest configuration for County Budget API tests."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an API client for testing."""
    return APIClient()


@pytest.fixture
def test_user(db):
    """Create and return a test user."""
    user = User.objects.create_user(
        email='test@example.com',
        full_name='Test User',
        password='testpassword123'
    )
    return user


@pytest.fixture
def auth_client(api_client, test_user):
    """Return an authenticated API client."""
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
