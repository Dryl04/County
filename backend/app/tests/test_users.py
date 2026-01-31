"""Tests for user endpoints including GDPR compliance."""


class TestUserEndpoints:
    """Tests for user profile and GDPR endpoints."""

    def test_get_current_user(self, client, auth_headers):
        """Test getting current user profile."""
        response = client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "full_name" in data

    def test_update_user(self, client, auth_headers):
        """Test updating user profile."""
        response = client.put(
            "/api/v1/users/me",
            json={"full_name": "Updated Name"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Name"

    def test_export_user_data(self, client, auth_headers):
        """Test GDPR data export endpoint."""
        # First create some data
        budget_resp = client.post(
            "/api/v1/budgets",
            json={"name": "Export Test Budget"},
            headers=auth_headers,
        )
        budget_id = budget_resp.json()["id"]

        client.post(
            "/api/v1/transactions",
            json={
                "budget_id": budget_id,
                "amount": "100.00",
                "type": "income",
            },
            headers=auth_headers,
        )

        # Export data
        response = client.get("/api/v1/users/me/export", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        # Verify export structure
        assert "export_date" in data
        assert "user" in data
        assert "budgets" in data
        assert "categories" in data
        assert "transactions" in data
        assert "audit_logs" in data

        # Verify data was included
        assert len(data["budgets"]) >= 1
        assert len(data["transactions"]) >= 1

    def test_soft_delete_user(self, client, db_session):
        """Test that user deletion is soft delete."""
        from app.models import User
        from app.core.security import get_password_hash

        # Create a new user
        user = User(
            email="deleteme@example.com",
            full_name="Delete Me",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        user_id = str(user.id)

        # Login as this user
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "deleteme@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Delete user
        delete_response = client.delete("/api/v1/users/me", headers=headers)
        assert delete_response.status_code == 204

        # Verify user still exists in DB but is soft deleted
        deleted_user = db_session.query(User).filter(User.id == user_id).first()
        assert deleted_user is not None
        assert deleted_user.is_deleted is True
        assert deleted_user.deleted_at is not None

        # Verify user cannot login anymore
        login_response2 = client.post(
            "/api/v1/auth/login",
            json={"email": "deleteme@example.com", "password": "password123"},
        )
        assert login_response2.status_code == 401
