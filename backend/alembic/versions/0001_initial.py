"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-07-27
"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable pgcrypto for gen_random_uuid (Postgres). If using sqlite this will be ignored.
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    except Exception:
        pass

    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'conversations',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('conversation_id', sa.String(length=36), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'memories',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('type', sa.String(length=64), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('importance', sa.Float(), server_default='0.0'),
        sa.Column('confidence', sa.Float(), server_default='0.0'),
        sa.Column('archived', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('mission', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='active'),
        sa.Column('priority', sa.String(length=32), nullable=True),
        sa.Column('progress', sa.Float(), server_default='0.0'),
        sa.Column('milestones', sa.Text(), nullable=True),
        sa.Column('next_step', sa.Text(), nullable=True),
        sa.Column('review_date', sa.String(length=32), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'growth_entries',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('date', sa.String(length=32), nullable=True),
        sa.Column('observation', sa.Text(), nullable=False),
        sa.Column('lesson', sa.Text(), nullable=True),
        sa.Column('future_action', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'settings',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('key', sa.String(length=128), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
    )
    op.create_index('ix_settings_user_key', 'settings', ['user_id', 'key'], unique=False)


def downgrade():
    op.drop_index('ix_settings_user_key', table_name='settings')
    op.drop_table('settings')
    op.drop_table('growth_entries')
    op.drop_table('projects')
    op.drop_table('memories')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('users')
