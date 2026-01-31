"""Tests for category endpoints."""

import pytest


class TestCategoryEndpoints:
    """Tests for category CRUD endpoints."""

    @pytest.fixture
    def budget_id(self, client, auth_headers):
        """Create a test budget and return its ID."""
        response = client.post(
            "/api/v1/budgets",
            json={"name": "Test Budget"},
            headers=auth_headers,
        )
        return response.json()["id"]

    def test_create_category(self, client, auth_headers, budget_id):
        """Test creating a new category."""
        response = client.post(
            "/api/v1/categories",
            json={
                "budget_id": budget_id,
                "name": "Food",
                "color": "#ff5733",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Food"
        assert data["color"] == "#ff5733"

    def test_unique_category_name_in_budget(self, client, auth_headers, budget_id):
        """Test that category names must be unique within a budget."""
        # Create first category
        client.post(
            "/api/v1/categories",
            json={
                "budget_id": budget_id,
                "name": "Duplicate",
            },
            headers=auth_headers,
        )

        # Try to create category with same name
        response = client.post(
            "/api/v1/categories",
            json={
                "budget_id": budget_id,
                "name": "Duplicate",
            },
            headers=auth_headers,
        )
        assert response.status_code == 409

    def test_same_category_name_different_budgets(self, client, auth_headers):
        """Test that same category name can exist in different budgets."""
        # Create two budgets
        budget1 = client.post(
            "/api/v1/budgets",
            json={"name": "Budget 1"},
            headers=auth_headers,
        ).json()["id"]
        
        budget2 = client.post(
            "/api/v1/budgets",
            json={"name": "Budget 2"},
            headers=auth_headers,
        ).json()["id"]

        # Create same name category in both budgets
        response1 = client.post(
            "/api/v1/categories",
            json={"budget_id": budget1, "name": "Food"},
            headers=auth_headers,
        )
        assert response1.status_code == 201

        response2 = client.post(
            "/api/v1/categories",
            json={"budget_id": budget2, "name": "Food"},
            headers=auth_headers,
        )
        assert response2.status_code == 201

    def test_cannot_delete_category_with_transactions(self, client, auth_headers, budget_id):
        """Test that categories with transactions cannot be deleted."""
        # Create category
        category_response = client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Food"},
            headers=auth_headers,
        )
        category_id = category_response.json()["id"]

        # Create transaction with this category
        client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "category_id": category_id,
                "amount": "50.00",
                "type": "expense",
            },
            headers=auth_headers,
        )

        # Try to delete category
        delete_response = client.delete(
            f"/api/v1/categories/{category_id}",
            headers=auth_headers,
        )
        assert delete_response.status_code == 409
        assert "transaction" in delete_response.json()["detail"]["error"]["message"].lower()

    def test_delete_category_without_transactions(self, client, auth_headers, budget_id):
        """Test that categories without transactions can be deleted."""
        # Create category
        category_response = client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Empty Category"},
            headers=auth_headers,
        )
        category_id = category_response.json()["id"]

        # Delete category
        delete_response = client.delete(
            f"/api/v1/categories/{category_id}",
            headers=auth_headers,
        )
        assert delete_response.status_code == 204

    def test_list_categories(self, client, auth_headers, budget_id):
        """Test listing categories for a budget."""
        # Create some categories
        client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Cat1"},
            headers=auth_headers,
        )
        client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Cat2"},
            headers=auth_headers,
        )

        response = client.get(
            f"/api/v1/categories?budget_id={budget_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_update_category_unique_name(self, client, auth_headers, budget_id):
        """Test updating category name checks uniqueness."""
        # Create two categories
        client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Cat1"},
            headers=auth_headers,
        )
        cat2 = client.post(
            "/api/v1/categories",
            json={"budget_id": budget_id, "name": "Cat2"},
            headers=auth_headers,
        ).json()["id"]

        # Try to rename Cat2 to Cat1
        response = client.put(
            f"/api/v1/categories/{cat2}",
            json={"name": "Cat1"},
            headers=auth_headers,
        )
        assert response.status_code == 409
