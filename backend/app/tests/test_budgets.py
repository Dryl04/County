"""Tests for budget endpoints."""



class TestBudgetEndpoints:
    """Tests for budget CRUD endpoints."""

    def test_create_budget(self, client, auth_headers):
        """Test creating a new budget."""
        response = client.post(
            "/api/v1/budgets",
            json={
                "name": "Monthly Budget",
                "description": "My monthly budget",
                "total_amount": "1000.00",
                "currency": "EUR",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Monthly Budget"
        assert data["description"] == "My monthly budget"
        assert data["currency"] == "EUR"

    def test_list_budgets(self, client, auth_headers):
        """Test listing budgets."""
        # Create a budget first
        client.post(
            "/api/v1/budgets",
            json={"name": "Test Budget"},
            headers=auth_headers,
        )

        response = client.get("/api/v1/budgets", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_budget(self, client, auth_headers):
        """Test getting a specific budget."""
        # Create a budget
        create_response = client.post(
            "/api/v1/budgets",
            json={"name": "Test Budget"},
            headers=auth_headers,
        )
        budget_id = create_response.json()["id"]

        response = client.get(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == budget_id

    def test_update_budget(self, client, auth_headers):
        """Test updating a budget."""
        # Create a budget
        create_response = client.post(
            "/api/v1/budgets",
            json={"name": "Original Name"},
            headers=auth_headers,
        )
        budget_id = create_response.json()["id"]

        # Update it
        response = client.put(
            f"/api/v1/budgets/{budget_id}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    def test_delete_budget(self, client, auth_headers):
        """Test deleting a budget."""
        # Create a budget
        create_response = client.post(
            "/api/v1/budgets",
            json={"name": "To Delete"},
            headers=auth_headers,
        )
        budget_id = create_response.json()["id"]

        # Delete it
        response = client.delete(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify it's deleted
        get_response = client.get(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_budget_not_found(self, client, auth_headers):
        """Test getting a nonexistent budget."""
        response = client.get(
            "/api/v1/budgets/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_unauthorized_access(self, client):
        """Test accessing budgets without authentication."""
        response = client.get("/api/v1/budgets")
        assert response.status_code == 403
