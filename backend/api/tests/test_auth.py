"""Tests for authentication endpoints."""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAuthRegister:
    """Tests for POST /api/v1/auth/register endpoint."""

    def test_register_success(self, api_client):
        """Test successful user registration."""
        response = api_client.post(
            '/api/v1/auth/register',
            {
                'email': 'newuser@example.com',
                'full_name': 'New User',
                'password': 'securepassword123',
            },
            format='json'
        )
        assert response.status_code == 201
        data = response.json()
        assert data['email'] == 'newuser@example.com'
        assert data['full_name'] == 'New User'
        assert 'id' in data
        assert 'password' not in data

    def test_register_duplicate_email(self, api_client, test_user):
        """Test registration with duplicate email."""
        response = api_client.post(
            '/api/v1/auth/register',
            {
                'email': 'test@example.com',
                'full_name': 'Another User',
                'password': 'securepassword123',
            },
            format='json'
        )
        assert response.status_code == 409
        assert 'error' in response.json()['detail']

    def test_register_invalid_email(self, api_client):
        """Test registration with invalid email."""
        response = api_client.post(
            '/api/v1/auth/register',
            {
                'email': 'not-an-email',
                'full_name': 'Test User',
                'password': 'securepassword123',
            },
            format='json'
        )
        assert response.status_code == 422


@pytest.mark.django_db
class TestAuthLogin:
    """Tests for POST /api/v1/auth/login endpoint."""

    def test_login_success(self, api_client, test_user):
        """Test successful login."""
        response = api_client.post(
            '/api/v1/auth/login',
            {'email': 'test@example.com', 'password': 'testpassword123'},
            format='json'
        )
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['token_type'] == 'bearer'

    def test_login_invalid_password(self, api_client, test_user):
        """Test login with invalid password."""
        response = api_client.post(
            '/api/v1/auth/login',
            {'email': 'test@example.com', 'password': 'wrongpassword'},
            format='json'
        )
        assert response.status_code == 401
        assert 'error' in response.json()['detail']

    def test_login_nonexistent_user(self, api_client):
        """Test login with nonexistent user."""
        response = api_client.post(
            '/api/v1/auth/login',
            {'email': 'nonexistent@example.com', 'password': 'anypassword'},
            format='json'
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestAuthRefresh:
    """Tests for POST /api/v1/auth/refresh endpoint."""

    def test_refresh_success(self, api_client, test_user):
        """Test successful token refresh."""
        # First login
        login_response = api_client.post(
            '/api/v1/auth/login',
            {'email': 'test@example.com', 'password': 'testpassword123'},
            format='json'
        )
        refresh_token = login_response.json()['refresh_token']

        # Then refresh
        response = api_client.post(
            '/api/v1/auth/refresh',
            {'refresh_token': refresh_token},
            format='json'
        )
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'refresh_token' in data

    def test_refresh_invalid_token(self, api_client):
        """Test refresh with invalid token."""
        response = api_client.post(
            '/api/v1/auth/refresh',
            {'refresh_token': 'invalid-token'},
            format='json'
        )
        assert response.status_code == 401
