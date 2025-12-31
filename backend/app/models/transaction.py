"""Transaction SQLAlchemy model."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class TransactionType(str, Enum):
    """Enum for transaction types."""

    INCOME = "income"
    EXPENSE = "expense"


class Transaction(Base):
    """Transaction model for tracking income and expenses."""

    __tablename__ = "transactions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    budget_id = Column(
        GUID(), ForeignKey("budgets.id", ondelete="CASCADE"), nullable=False
    )
    category_id = Column(
        GUID(),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="EUR", nullable=False)
    type = Column(String(10), nullable=False)  # 'income' or 'expense'
    note = Column(String(500), nullable=True)
    occurred_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
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
    budget = relationship("Budget", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    # Indexes for efficient queries
    __table_args__ = (
        Index("ix_transactions_budget_id_occurred_at", "budget_id", "occurred_at"),
        Index("ix_transactions_category_id", "category_id"),
    )

    def __repr__(self) -> str:
        return f"<Transaction {self.type} {self.amount}>"

