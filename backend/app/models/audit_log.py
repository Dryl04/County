"""AuditLog SQLAlchemy model for tracking sensitive actions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class AuditLog(Base):
    """Audit log model for tracking user actions."""

    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(GUID(), nullable=True)
    payload = Column(Text, nullable=True)  # JSON string (for SQLite compatibility)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog {self.action}>"

