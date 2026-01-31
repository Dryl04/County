"""Authentication API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.core.security import verify_password, get_password_hash
from app.db.session import get_db
from app.models import User
from app.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> User:
    """Register a new user."""
    # Check if email already exists (including soft-deleted for uniqueness)
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": {
                    "code": "CONFLICT",
                    "message": "Email already registered",
                    "details": {"field": "email", "issue": "already exists"},
                }
            },
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """Authenticate user and return JWT tokens."""
    # Exclude soft-deleted users from login
    user = db.query(User).filter(
        User.email == login_data.email,
        User.is_deleted == False
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid email or password",
                }
            },
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token_data: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict:
    """Refresh access token using refresh token."""
    payload = decode_token(token_data.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid or expired refresh token",
                }
            },
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid token type",
                }
            },
        )

    user_id = payload.get("sub")
    # Exclude soft-deleted users from refresh
    user = db.query(User).filter(
        User.id == UUID(user_id),
        User.is_deleted == False
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "User not found",
                }
            },
        )

    # Generate new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> Response:
    """Logout user (client should discard tokens)."""
    # In a stateless JWT system, logout is handled client-side
    # For production, consider implementing a token blacklist
    return Response(status_code=status.HTTP_204_NO_CONTENT)
