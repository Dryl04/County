"""Transaction API routes with pagination."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Budget, Category, Transaction, User
from app.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


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


def verify_category_ownership(category_id: UUID, user_id: UUID, db: Session) -> Optional[Category]:
    """Verify that the user owns the category."""
    if category_id is None:
        return None
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
    verify_budget_ownership(category.budget_id, user_id, db)
    return category


@router.get("", response_model=TransactionListResponse)
def list_transactions(
    budget_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """List transactions for a budget with pagination."""
    verify_budget_ownership(budget_id, current_user.id, db)

    # Get total count
    total = db.query(Transaction).filter(Transaction.budget_id == budget_id).count()

    # Calculate pagination
    pages = (total + per_page - 1) // per_page if total > 0 else 1
    offset = (page - 1) * per_page

    # Get paginated transactions
    transactions = (
        db.query(Transaction)
        .filter(Transaction.budget_id == budget_id)
        .order_by(Transaction.occurred_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return {
        "items": transactions,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    """Create a new transaction."""
    verify_budget_ownership(transaction_data.budget_id, current_user.id, db)

    if transaction_data.category_id:
        verify_category_ownership(transaction_data.category_id, current_user.id, db)

    transaction = Transaction(
        budget_id=transaction_data.budget_id,
        category_id=transaction_data.category_id,
        amount=transaction_data.amount,
        currency=transaction_data.currency,
        type=transaction_data.type.value,
        note=transaction_data.note,
        occurred_at=transaction_data.occurred_at or datetime.now(timezone.utc),
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    """Get a specific transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Transaction not found",
                }
            },
        )

    verify_budget_ownership(transaction.budget_id, current_user.id, db)

    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: UUID,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    """Update a specific transaction."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Transaction not found",
                }
            },
        )

    verify_budget_ownership(transaction.budget_id, current_user.id, db)

    if transaction_data.category_id is not None:
        verify_category_ownership(transaction_data.category_id, current_user.id, db)
        transaction.category_id = transaction_data.category_id

    if transaction_data.amount is not None:
        transaction.amount = transaction_data.amount
    if transaction_data.currency is not None:
        transaction.currency = transaction_data.currency
    if transaction_data.type is not None:
        transaction.type = transaction_data.type.value
    if transaction_data.note is not None:
        transaction.note = transaction_data.note
    if transaction_data.occurred_at is not None:
        transaction.occurred_at = transaction_data.occurred_at

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a specific transaction."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Transaction not found",
                }
            },
        )

    verify_budget_ownership(transaction.budget_id, current_user.id, db)

    db.delete(transaction)
    db.commit()
