"""Add soft delete columns and category unique constraint

Revision ID: 002
Revises: e706b19a6596
Create Date: 2026-01-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = 'e706b19a6596'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add soft delete columns to users table
    op.add_column('users', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    # Add soft delete columns to budgets table
    op.add_column('budgets', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('budgets', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    # Add unique constraint for category name within budget
    op.create_unique_constraint('uq_category_budget_name', 'categories', ['budget_id', 'name'])


def downgrade() -> None:
    # Remove unique constraint from categories
    op.drop_constraint('uq_category_budget_name', 'categories', type_='unique')

    # Remove soft delete columns from budgets
    op.drop_column('budgets', 'deleted_at')
    op.drop_column('budgets', 'is_deleted')

    # Remove soft delete columns from users
    op.drop_column('users', 'deleted_at')
    op.drop_column('users', 'is_deleted')
