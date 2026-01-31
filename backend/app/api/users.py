"""User API routes."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.audit import create_audit_log, AuditActions
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models import User, Budget, Category, Transaction, AuditLog
from app.schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)) -> User:
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    request: Request,
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

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.USER_UPDATE,
        resource_type="user",
        resource_id=current_user.id,
        payload={
            "updated_fields": [k for k, v in user_data.model_dump(exclude_unset=True).items() if k != "password"],
        },
        request=request,
    )

    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Soft-delete current user's account (preserves transaction history)."""
    # Create audit log before soft-delete
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.USER_DELETE,
        resource_type="user",
        resource_id=current_user.id,
        payload={
            "email": current_user.email,
        },
        request=request,
    )
    
    # Soft delete the user
    current_user.is_deleted = True
    current_user.deleted_at = datetime.now(timezone.utc)
    # Anonymize email for privacy while keeping record
    current_user.email = f"deleted_{current_user.id}@deleted.local"
    
    db.commit()


@router.get("/me/export")
def export_user_data(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JSONResponse:
    """Export all user data (GDPR compliance).
    
    Returns all data associated with the user account including:
    - User profile information
    - All budgets
    - All categories
    - All transactions
    - Audit logs related to the user
    """
    # Create audit log for data export
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.USER_DATA_EXPORT,
        resource_type="user",
        resource_id=current_user.id,
        payload={},
        request=request,
    )
    db.commit()
    
    # Collect user data
    user_data = {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "preferred_currency": current_user.preferred_currency,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
    }
    
    # Collect budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budgets_data = [
        {
            "id": str(b.id),
            "name": b.name,
            "description": b.description,
            "total_amount": str(b.total_amount),
            "currency": b.currency,
            "is_deleted": b.is_deleted,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "updated_at": b.updated_at.isoformat() if b.updated_at else None,
        }
        for b in budgets
    ]
    
    # Collect categories (for user's budgets)
    budget_ids = [b.id for b in budgets]
    categories = db.query(Category).filter(Category.budget_id.in_(budget_ids)).all() if budget_ids else []
    categories_data = [
        {
            "id": str(c.id),
            "budget_id": str(c.budget_id),
            "name": c.name,
            "color": c.color,
            "icon": c.icon,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in categories
    ]
    
    # Collect transactions (for user's budgets)
    transactions = db.query(Transaction).filter(Transaction.budget_id.in_(budget_ids)).all() if budget_ids else []
    transactions_data = [
        {
            "id": str(t.id),
            "budget_id": str(t.budget_id),
            "category_id": str(t.category_id) if t.category_id else None,
            "amount": str(t.amount),
            "currency": t.currency,
            "type": t.type,
            "note": t.note,
            "occurred_at": t.occurred_at.isoformat() if t.occurred_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for t in transactions
    ]
    
    # Collect audit logs for user
    audit_logs = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).all()
    audit_logs_data = [
        {
            "id": str(a.id),
            "action": a.action,
            "resource_type": a.resource_type,
            "resource_id": str(a.resource_id) if a.resource_id else None,
            "payload": json.loads(a.payload) if a.payload else None,
            "ip_address": a.ip_address,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in audit_logs
    ]
    
    export_data = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user": user_data,
        "budgets": budgets_data,
        "categories": categories_data,
        "transactions": transactions_data,
        "audit_logs": audit_logs_data,
    }
    
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=county_data_export_{current_user.id}.json"
        }
    )
