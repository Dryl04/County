"""Tests for transaction endpoints."""

import pytest


class TestTransactionEndpoints:
    """Tests for transaction CRUD endpoints with pagination."""

    @pytest.fixture
    def budget_id(self, client, auth_headers):
        """Create a test budget and return its ID."""
        response = client.post(
            "/api/v1/budgets",
            json={"name": "Test Budget"},
            headers=auth_headers,
        )
        return response.json()["id"]

    def test_create_transaction(self, client, auth_headers, budget_id):
        """Test creating a new transaction."""
        response = client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "amount": "50.00",
                "currency": "EUR",
                "type": "expense",
                "note": "Lunch",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == "50.00"
        assert data["type"] == "expense"
        assert data["note"] == "Lunch"

    def test_list_transactions_with_pagination(self, client, auth_headers, budget_id):
        """Test listing transactions with pagination."""
        # Create multiple transactions
        for i in range(5):
            client.post(
                "/api/v1/transactions",
                json={
                    "budget_id": budget_id,
                    "amount": f"{i * 10}.00",
                    "type": "expense",
                },
                headers=auth_headers,
            )

        # Test pagination
        response = client.get(
            f"/api/v1/transactions?budget_id={budget_id}&page=1&per_page=2",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "pages" in data
        assert len(data["items"]) <= 2
        assert data["page"] == 1

    def test_get_transaction(self, client, auth_headers, budget_id):
        """Test getting a specific transaction."""
        # Create a transaction
        create_response = client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "amount": "25.00",
                "type": "income",
            },
            headers=auth_headers,
        )
        transaction_id = create_response.json()["id"]

        response = client.get(
            f"/api/v1/transactions/{transaction_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["id"] == transaction_id

    def test_update_transaction(self, client, auth_headers, budget_id):
        """Test updating a transaction."""
        # Create a transaction
        create_response = client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "amount": "100.00",
                "type": "expense",
            },
            headers=auth_headers,
        )
        transaction_id = create_response.json()["id"]

        # Update it
        response = client.put(
            f"/api/v1/transactions/{transaction_id}",
            json={"amount": "150.00", "note": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["amount"] == "150.00"
        assert response.json()["note"] == "Updated"

    def test_delete_transaction(self, client, auth_headers, budget_id):
        """Test deleting a transaction."""
        # Create a transaction
        create_response = client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "amount": "30.00",
                "type": "expense",
            },
            headers=auth_headers,
        )
        transaction_id = create_response.json()["id"]

        # Delete it
        response = client.delete(
            f"/api/v1/transactions/{transaction_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Verify it's deleted
        get_response = client.get(
            f"/api/v1/transactions/{transaction_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 404

    def test_transaction_not_found(self, client, auth_headers):
        """Test getting a nonexistent transaction."""
        response = client.get(
            "/api/v1/transactions/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404
