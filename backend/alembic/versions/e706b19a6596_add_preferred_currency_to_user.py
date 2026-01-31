"""add_preferred_currency_to_user

Revision ID: e706b19a6596
Revises: 001
Create Date: 2026-01-30 16:17:17.673723

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e706b19a6596'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add preferred_currency column to users table
    op.add_column('users', sa.Column('preferred_currency', sa.String(length=3), nullable=False, server_default='EUR'))


def downgrade() -> None:
    # Remove preferred_currency column from users table
    op.drop_column('users', 'preferred_currency')
