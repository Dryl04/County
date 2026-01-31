"""Category API routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_current_user
from app.core.audit import create_audit_log, AuditActions
from app.db.session import get_db
from app.models import Budget, Category, Transaction, User
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


def verify_budget_ownership(budget_id: UUID, user_id: UUID, db: Session) -> Budget:
    """Verify that the user owns the budget."""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user_id,
        Budget.is_deleted == False
    ).first()
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


def check_category_name_unique(budget_id: UUID, name: str, db: Session, exclude_id: UUID = None) -> None:
    """Check that category name is unique within the budget."""
    query = db.query(Category).filter(
        Category.budget_id == budget_id,
        Category.name == name
    )
    if exclude_id:
        query = query.filter(Category.id != exclude_id)
    
    if query.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": {
                    "code": "CONFLICT",
                    "message": "A category with this name already exists in this budget",
                    "details": {"field": "name", "issue": "already exists"},
                }
            },
        )


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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    """Create a new category."""
    verify_budget_ownership(category_data.budget_id, current_user.id, db)
    
    # Check unique name within budget
    check_category_name_unique(category_data.budget_id, category_data.name, db)

    category = Category(
        budget_id=category_data.budget_id,
        name=category_data.name,
        color=category_data.color,
        icon=category_data.icon,
    )
    
    try:
        db.add(category)
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user.id,
            action=AuditActions.CREATE_CATEGORY,
            resource_type="category",
            resource_id=category.id,
            payload={
                "budget_id": str(category_data.budget_id),
                "name": category_data.name,
            },
            request=request,
        )
        
        db.commit()
        db.refresh(category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": {
                    "code": "CONFLICT",
                    "message": "A category with this name already exists in this budget",
                    "details": {"field": "name", "issue": "already exists"},
                }
            },
        )
    
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
    request: Request,
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

    # Check unique name if name is being updated
    if category_data.name is not None and category_data.name != category.name:
        check_category_name_unique(category.budget_id, category_data.name, db, exclude_id=category_id)

    if category_data.name is not None:
        category.name = category_data.name
    if category_data.color is not None:
        category.color = category_data.color
    if category_data.icon is not None:
        category.icon = category_data.icon

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.UPDATE_CATEGORY,
        resource_type="category",
        resource_id=category_id,
        payload={
            "updated_fields": category_data.model_dump(exclude_unset=True),
        },
        request=request,
    )

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a specific category. Cannot delete if there are active transactions."""
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

    # Check for active transactions using this category
    transaction_count = db.query(Transaction).filter(
        Transaction.category_id == category_id
    ).count()
    
    if transaction_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": {
                    "code": "CONFLICT",
                    "message": f"Cannot delete category with {transaction_count} active transaction(s)",
                    "details": {
                        "transaction_count": transaction_count,
                        "suggestion": "Delete or reassign transactions before deleting this category",
                    },
                }
            },
        )

    # Create audit log before deletion
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditActions.DELETE_CATEGORY,
        resource_type="category",
        resource_id=category_id,
        payload={
            "budget_id": str(category.budget_id),
            "name": category.name,
        },
        request=request,
    )

    db.delete(category)
    db.commit()
