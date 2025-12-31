"""Category SQLAlchemy model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class Category(Base):
    """Category model for transaction categorization."""

    __tablename__ = "categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    budget_id = Column(
        GUID(), ForeignKey("budgets.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    color = Column(String(7), default="#6366f1", nullable=False)  # Hex color
    icon = Column(String(50), nullable=True)  # Icon identifier
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    budget = relationship("Budget", back_populates="categories")
    transactions = relationship(
        "Transaction", back_populates="category", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Category {self.name}>"

