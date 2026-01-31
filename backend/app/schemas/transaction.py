"""Pydantic schemas for Transaction model."""

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionType(str, Enum):
    """Enum for transaction types."""

    INCOME = "income"
    EXPENSE = "expense"


def validate_not_future_date(v: Optional[datetime]) -> Optional[datetime]:
    """Validate that a datetime is not in the future."""
    if v is not None:
        now = datetime.now(timezone.utc)
        # Make sure v is timezone-aware for comparison
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError('Transaction date cannot be in the future')
    return v


class TransactionBase(BaseModel):
    """Base transaction schema."""

    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    type: TransactionType
    note: Optional[str] = Field(None, max_length=500)
    occurred_at: Optional[datetime] = None

    @field_validator('occurred_at')
    @classmethod
    def validate_occurred_at(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validate that occurred_at is not in the future."""
        return validate_not_future_date(v)


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""

    budget_id: UUID
    category_id: Optional[UUID] = None


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""

    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    type: Optional[TransactionType] = None
    category_id: Optional[UUID] = None
    note: Optional[str] = Field(None, max_length=500)
    occurred_at: Optional[datetime] = None

    @field_validator('occurred_at')
    @classmethod
    def validate_occurred_at(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validate that occurred_at is not in the future."""
        return validate_not_future_date(v)


class CategoryInfo(BaseModel):
    """Nested schema for category information in transaction response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    color: str


class BudgetInfo(BaseModel):
    """Nested schema for budget information in transaction response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    currency: str


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    budget_id: UUID
    category_id: Optional[UUID]
    budget: Optional[BudgetInfo] = None
    category: Optional[CategoryInfo] = None
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    """Schema for paginated transaction list."""

    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int
    pages: int


