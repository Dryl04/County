"""Pydantic schemas for Category model."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    """Base category schema."""

    name: str = Field(..., min_length=1, max_length=255)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""

    budget_id: UUID


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryResponse(CategoryBase):
    """Schema for category response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    budget_id: UUID
    created_at: datetime
    updated_at: datetime

