"""Budget API routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Budget, User
from app.schemas import BudgetCreate, BudgetUpdate, BudgetResponse

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetResponse])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Budget]:
    """List all budgets for the current user."""
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    """Create a new budget."""
    budget = Budget(
        user_id=current_user.id,
        name=budget_data.name,
        description=budget_data.description,
        total_amount=budget_data.total_amount,
        currency=budget_data.currency,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    """Get a specific budget by ID."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
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


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: UUID,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    """Update a specific budget."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
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

    if budget_data.name is not None:
        budget.name = budget_data.name
    if budget_data.description is not None:
        budget.description = budget_data.description
    if budget_data.total_amount is not None:
        budget.total_amount = budget_data.total_amount
    if budget_data.currency is not None:
        budget.currency = budget_data.currency

    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a specific budget."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
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
    db.delete(budget)
    db.commit()
