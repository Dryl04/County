"""Initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, default='user'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Create budgets table
    op.create_table(
        'budgets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('total_amount', sa.Numeric(15, 2), nullable=False, default=0),
        sa.Column('currency', sa.String(3), nullable=False, default='EUR'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('budget_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('budgets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('color', sa.String(7), nullable=False, default='#6366f1'),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create transactions table
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('budget_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('budgets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, default='EUR'),
        sa.Column('type', sa.String(10), nullable=False),
        sa.Column('note', sa.String(500), nullable=True),
        sa.Column('occurred_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_transactions_budget_id_occurred_at', 'transactions', ['budget_id', 'occurred_at'])
    op.create_index('ix_transactions_category_id', 'transactions', ['category_id'])

    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payload', postgresql.JSONB, nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('transactions')
    op.drop_table('categories')
    op.drop_table('budgets')
    op.drop_table('users')
