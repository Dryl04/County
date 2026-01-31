"""Tests for budget endpoints."""

import pytest


@pytest.mark.django_db
class TestBudgetEndpoints:
    """Tests for budget CRUD endpoints."""

    def test_create_budget(self, auth_client):
        """Test creating a new budget."""
        response = auth_client.post(
            '/api/v1/budgets',
            {
                'name': 'Monthly Budget',
                'description': 'My monthly budget',
                'total_amount': '1000.00',
                'currency': 'EUR',
            },
            format='json'
        )
        assert response.status_code == 201
        data = response.json()
        assert data['name'] == 'Monthly Budget'
        assert data['description'] == 'My monthly budget'
        assert data['currency'] == 'EUR'

    def test_list_budgets(self, auth_client):
        """Test listing budgets."""
        # Create a budget first
        auth_client.post(
            '/api/v1/budgets',
            {'name': 'Test Budget'},
            format='json'
        )

        response = auth_client.get('/api/v1/budgets')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_budget(self, auth_client):
        """Test getting a specific budget."""
        # Create a budget
        create_response = auth_client.post(
            '/api/v1/budgets',
            {'name': 'Test Budget'},
            format='json'
        )
        budget_id = create_response.json()['id']

        response = auth_client.get(f'/api/v1/budgets/{budget_id}')
        assert response.status_code == 200
        assert response.json()['id'] == budget_id

    def test_update_budget(self, auth_client):
        """Test updating a budget."""
        # Create a budget
        create_response = auth_client.post(
            '/api/v1/budgets',
            {'name': 'Original Name'},
            format='json'
        )
        budget_id = create_response.json()['id']

        # Update it
        response = auth_client.put(
            f'/api/v1/budgets/{budget_id}',
            {'name': 'Updated Name'},
            format='json'
        )
        assert response.status_code == 200
        assert response.json()['name'] == 'Updated Name'

    def test_delete_budget(self, auth_client):
        """Test deleting a budget."""
        # Create a budget
        create_response = auth_client.post(
            '/api/v1/budgets',
            {'name': 'To Delete'},
            format='json'
        )
        budget_id = create_response.json()['id']

        # Delete it
        response = auth_client.delete(f'/api/v1/budgets/{budget_id}')
        assert response.status_code == 204

        # Verify it's deleted
        get_response = auth_client.get(f'/api/v1/budgets/{budget_id}')
        assert get_response.status_code == 404

    def test_budget_not_found(self, auth_client):
        """Test getting a nonexistent budget."""
        response = auth_client.get(
            '/api/v1/budgets/00000000-0000-0000-0000-000000000000'
        )
        assert response.status_code == 404

    def test_unauthorized_access(self, api_client):
        """Test accessing budgets without authentication."""
        response = api_client.get('/api/v1/budgets')
        assert response.status_code == 401
