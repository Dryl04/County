"""Budget API routes."""

from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.audit import create_audit_log, AuditActions
from app.db.session import get_db
from app.models import Budget, User
from app.schemas import BudgetCreate, BudgetUpdate, BudgetResponse

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetResponse])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Budget]:
    """List all budgets for the current user (excluding soft-deleted)."""
    return db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_deleted == False
    ).all()


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    request: Request,
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
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.CREATE_BUDGET,
        resource_type="budget",
        resource_id=budget.id,
        payload={
            "name": budget_data.name,
            "total_amount": str(budget_data.total_amount),
            "currency": budget_data.currency,
        },
        request=request,
    )
    
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
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
            Budget.is_deleted == False
        )
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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    """Update a specific budget."""
    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
            Budget.is_deleted == False
        )
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

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.UPDATE_BUDGET,
        resource_type="budget",
        resource_id=budget_id,
        payload={
            "updated_fields": budget_data.model_dump(exclude_unset=True, mode="json"),
        },
        request=request,
    )

    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Soft-delete a specific budget (reversible)."""
    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
            Budget.is_deleted == False
        )
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
    
    # Soft delete instead of hard delete
    budget.is_deleted = True
    budget.deleted_at = datetime.now(timezone.utc)
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.DELETE_BUDGET,
        resource_type="budget",
        resource_id=budget_id,
        payload={
            "name": budget.name,
            "total_amount": str(budget.total_amount),
        },
        request=request,
    )
    
    db.commit()


@router.post("/{budget_id}/restore", response_model=BudgetResponse)
def restore_budget(
    budget_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    """Restore a soft-deleted budget."""
    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
            Budget.is_deleted == True
        )
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Deleted budget not found",
                }
            },
        )
    
    # Restore the budget
    budget.is_deleted = False
    budget.deleted_at = None
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="RESTORE_BUDGET",
        resource_type="budget",
        resource_id=budget_id,
        payload={
            "name": budget.name,
        },
        request=request,
    )
    
    db.commit()
    db.refresh(budget)
    return budget
