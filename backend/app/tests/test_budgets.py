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
        """Test deleting a budget (soft delete)."""
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

        # Verify it's not visible (soft deleted)
        get_response = client.get(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_restore_budget(self, client, auth_headers):
        """Test restoring a soft-deleted budget."""
        # Create and delete a budget
        create_response = client.post(
            "/api/v1/budgets",
            json={"name": "To Restore"},
            headers=auth_headers,
        )
        budget_id = create_response.json()["id"]
        client.delete(f"/api/v1/budgets/{budget_id}", headers=auth_headers)

        # Restore it
        restore_response = client.post(
            f"/api/v1/budgets/{budget_id}/restore",
            headers=auth_headers,
        )
        assert restore_response.status_code == 200
        assert restore_response.json()["name"] == "To Restore"

        # Verify it's visible again
        get_response = client.get(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
        assert get_response.status_code == 200

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

    def test_negative_budget_rejected(self, client, auth_headers):
        """Test that negative budget amounts are rejected."""
        response = client.post(
            "/api/v1/budgets",
            json={
                "name": "Negative Budget",
                "total_amount": "-100.00",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422
