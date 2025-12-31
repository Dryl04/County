"""Category API routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Budget, Category, User
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


def verify_budget_ownership(budget_id: UUID, user_id: UUID, db: Session) -> Budget:
    """Verify that the user owns the budget."""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Budget not found",
                }
            },
        )
    return budget


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Category]:
    """List all categories for a budget."""
    verify_budget_ownership(budget_id, current_user.id, db)
    return db.query(Category).filter(Category.budget_id == budget_id).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    """Create a new category."""
    verify_budget_ownership(category_data.budget_id, current_user.id, db)

    category = Category(
        budget_id=category_data.budget_id,
        name=category_data.name,
        color=category_data.color,
        icon=category_data.icon,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    """Get a specific category by ID."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Category not found",
                }
            },
        )

    # Verify ownership
    verify_budget_ownership(category.budget_id, current_user.id, db)

    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    """Update a specific category."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Category not found",
                }
            },
        )

    verify_budget_ownership(category.budget_id, current_user.id, db)

    if category_data.name is not None:
        category.name = category_data.name
    if category_data.color is not None:
        category.color = category_data.color
    if category_data.icon is not None:
        category.icon = category_data.icon

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a specific category."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Category not found",
                }
            },
        )

    verify_budget_ownership(category.budget_id, current_user.id, db)

    db.delete(category)
    db.commit()
