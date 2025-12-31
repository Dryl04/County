"""Budget SQLAlchemy model."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class Budget(Base):
    """Budget model for tracking financial budgets."""

    __tablename__ = "budgets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    total_amount = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    currency = Column(String(3), default="EUR", nullable=False)
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
    user = relationship("User", back_populates="budgets")
    categories = relationship(
        "Category", back_populates="budget", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="budget", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Budget {self.name}>"

