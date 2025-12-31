"""Pytest configuration and fixtures."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import Base, get_db
from app.core.security import get_password_hash
from app.models import User

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client."""
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    """Get authentication headers for a test user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
