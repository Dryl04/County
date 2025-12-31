"""Pydantic schemas for Transaction model."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TransactionType(str, Enum):
    """Enum for transaction types."""

    INCOME = "income"
    EXPENSE = "expense"


class TransactionBase(BaseModel):
    """Base transaction schema."""

    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    type: TransactionType
    note: Optional[str] = Field(None, max_length=500)
    occurred_at: Optional[datetime] = None


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


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    budget_id: UUID
    category_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    """Schema for paginated transaction list."""

    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int
    pages: int


