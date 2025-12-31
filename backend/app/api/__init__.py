"""API routers for the County application."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.budgets import router as budgets_router
from app.api.categories import router as categories_router
from app.api.transactions import router as transactions_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(budgets_router)
api_router.include_router(categories_router)
api_router.include_router(transactions_router)
