"""Audit logging utility for tracking financial operations."""

import json
from typing import Optional, Any
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: Optional[UUID],
    action: str,
    resource_type: str,
    resource_id: Optional[UUID] = None,
    payload: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """Create an audit log entry for financial operations.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: The action performed (e.g., "DELETE_TRANSACTION", "CREATE_BUDGET")
        resource_type: Type of resource (e.g., "transaction", "budget")
        resource_id: ID of the resource being acted upon
        payload: Additional data about the action
        request: FastAPI request object for IP and user agent
    
    Returns:
        The created AuditLog entry
    """
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
    
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        payload=json.dumps(payload) if payload else None,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(audit_log)
    return audit_log


# Common audit action constants
class AuditActions:
    """Constants for audit log actions."""
    
    # Transaction actions
    CREATE_TRANSACTION = "CREATE_TRANSACTION"
    UPDATE_TRANSACTION = "UPDATE_TRANSACTION"
    DELETE_TRANSACTION = "DELETE_TRANSACTION"
    
    # Budget actions
    CREATE_BUDGET = "CREATE_BUDGET"
    UPDATE_BUDGET = "UPDATE_BUDGET"
    DELETE_BUDGET = "DELETE_BUDGET"
    
    # Category actions
    CREATE_CATEGORY = "CREATE_CATEGORY"
    UPDATE_CATEGORY = "UPDATE_CATEGORY"
    DELETE_CATEGORY = "DELETE_CATEGORY"
    
    # User actions
    USER_REGISTER = "USER_REGISTER"
    USER_LOGIN = "USER_LOGIN"
    USER_UPDATE = "USER_UPDATE"
    USER_DELETE = "USER_DELETE"
    USER_DATA_EXPORT = "USER_DATA_EXPORT"
