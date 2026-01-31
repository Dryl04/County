"""User API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)) -> User:
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """Update current user's profile."""
    # Check email uniqueness if updating email
    if user_data.email and user_data.email != current_user.email:
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
        current_user.email = user_data.email

    if user_data.full_name:
        current_user.full_name = user_data.full_name

    if user_data.password:
        current_user.hashed_password = get_password_hash(user_data.password)

    if user_data.preferred_currency:
        current_user.preferred_currency = user_data.preferred_currency

    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete current user's account."""
    db.delete(current_user)
    db.commit()
