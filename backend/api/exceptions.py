"""Custom exception handling for Django REST Framework."""

from rest_framework.views import exception_handler
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler to format error responses consistently."""
    response = exception_handler(exc, context)

    if response is not None:
        # Map status codes to error codes
        error_codes = {
            400: 'INVALID_INPUT',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_ERROR',
        }

        error_code = error_codes.get(response.status_code, 'UNKNOWN_ERROR')

        # Get the detail message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                # Already formatted or simple detail
                if isinstance(response.data['detail'], dict) and 'error' in response.data['detail']:
                    # Already in our format
                    return response
                message = str(response.data['detail'])
            else:
                # Validation errors
                message = 'Validation error'
                details = response.data
        elif isinstance(response.data, list):
            message = response.data[0] if response.data else 'Error'
            details = None
        else:
            message = str(response.data)
            details = None

        # Format response
        formatted_response = {
            'detail': {
                'error': {
                    'code': error_code,
                    'message': message,
                }
            }
        }

        # Add details if present (for validation errors)
        if 'details' in locals() and details:
            formatted_response['detail']['error']['details'] = details

        response.data = formatted_response

    return response


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
