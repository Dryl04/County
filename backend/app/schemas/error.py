"""Pydantic schemas for standardized error responses."""

from typing import Any, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Schema for error details."""

    field: Optional[str] = None
    issue: Optional[str] = None


class ErrorBody(BaseModel):
    """Schema for error body."""

    code: str
    message: str
    details: Optional[ErrorDetail] = None


class ErrorResponse(BaseModel):
    """Schema for standardized error response."""

    error: ErrorBody


# Error codes
class ErrorCodes:
    """Standard error codes."""

    INVALID_INPUT = "INVALID_INPUT"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
