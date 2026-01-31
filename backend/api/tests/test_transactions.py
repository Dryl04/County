"""Tests for transaction endpoints."""

import pytest


@pytest.mark.django_db
class TestTransactionEndpoints:
    """Tests for transaction CRUD endpoints with pagination."""

    @pytest.fixture
    def budget_id(self, auth_client):
        """Create a test budget and return its ID."""
        response = auth_client.post(
            '/api/v1/budgets',
            {'name': 'Test Budget'},
            format='json'
        )
        return response.json()['id']

    def test_create_transaction(self, auth_client, budget_id):
        """Test creating a new transaction."""
        response = auth_client.post(
            '/api/v1/transactions',
            {
                'budget_id': budget_id,
                'amount': '50.00',
                'currency': 'EUR',
                'type': 'expense',
                'note': 'Lunch',
            },
            format='json'
        )
        assert response.status_code == 201
        data = response.json()
        assert data['amount'] == '50.00'
        assert data['type'] == 'expense'
        assert data['note'] == 'Lunch'

    def test_list_transactions_with_pagination(self, auth_client, budget_id):
        """Test listing transactions with pagination."""
        # Create multiple transactions
        for i in range(5):
            auth_client.post(
                '/api/v1/transactions',
                {
                    'budget_id': budget_id,
                    'amount': f'{i * 10}.00',
                    'type': 'expense',
                },
                format='json'
            )

        # Test pagination
        response = auth_client.get(
            f'/api/v1/transactions?budget_id={budget_id}&page=1&per_page=2'
        )
        assert response.status_code == 200
        data = response.json()
        assert 'items' in data
        assert 'total' in data
        assert 'page' in data
        assert 'per_page' in data
        assert 'pages' in data
        assert len(data['items']) <= 2
        assert data['page'] == 1

    def test_get_transaction(self, auth_client, budget_id):
        """Test getting a specific transaction."""
        # Create a transaction
        create_response = auth_client.post(
            '/api/v1/transactions',
            {
                'budget_id': budget_id,
                'amount': '25.00',
                'type': 'income',
            },
            format='json'
        )
        transaction_id = create_response.json()['id']

        response = auth_client.get(f'/api/v1/transactions/{transaction_id}')
        assert response.status_code == 200
        assert response.json()['id'] == transaction_id

    def test_update_transaction(self, auth_client, budget_id):
        """Test updating a transaction."""
        # Create a transaction
        create_response = auth_client.post(
            '/api/v1/transactions',
            {
                'budget_id': budget_id,
                'amount': '100.00',
                'type': 'expense',
            },
            format='json'
        )
        transaction_id = create_response.json()['id']

        # Update it
        response = auth_client.put(
            f'/api/v1/transactions/{transaction_id}',
            {'amount': '150.00', 'note': 'Updated'},
            format='json'
        )
        assert response.status_code == 200
        assert response.json()['amount'] == '150.00'
        assert response.json()['note'] == 'Updated'

    def test_delete_transaction(self, auth_client, budget_id):
        """Test deleting a transaction."""
        # Create a transaction
        create_response = auth_client.post(
            '/api/v1/transactions',
            {
                'budget_id': budget_id,
                'amount': '30.00',
                'type': 'expense',
            },
            format='json'
        )
        transaction_id = create_response.json()['id']

        # Delete it
        response = auth_client.delete(f'/api/v1/transactions/{transaction_id}')
        assert response.status_code == 204

        # Verify it's deleted
        get_response = auth_client.get(f'/api/v1/transactions/{transaction_id}')
        assert get_response.status_code == 404

    def test_transaction_not_found(self, auth_client):
        """Test getting a nonexistent transaction."""
        response = auth_client.get(
            '/api/v1/transactions/00000000-0000-0000-0000-000000000000'
        )
        assert response.status_code == 404
