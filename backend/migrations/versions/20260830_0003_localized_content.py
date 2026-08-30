"""Add English variants for managed beneficiary content.

Revision ID: 20260830_0003
Revises: 20260822_0002
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260830_0003"
down_revision: str | None = "20260822_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


LOCALIZED_COLUMNS: dict[str, list[sa.Column[object]]] = {
    "events": [
        sa.Column("name_en", sa.String(length=240), nullable=True),
        sa.Column("date_label_en", sa.String(length=160), nullable=True),
        sa.Column("time_label_en", sa.String(length=160), nullable=True),
        sa.Column("location_en", sa.String(length=500), nullable=True),
    ],
    "daily_readings": [
        sa.Column("date_label_en", sa.String(length=160), nullable=True),
        sa.Column("reference_en", sa.String(length=160), nullable=True),
        sa.Column("title_en", sa.String(length=160), nullable=True),
        sa.Column("content_en", sa.Text(), nullable=True),
    ],
    "spiritual_activities": [
        sa.Column("title_en", sa.String(length=240), nullable=True),
        sa.Column("description_en", sa.Text(), nullable=True),
    ],
    "reflection_lessons": [
        sa.Column("date_label_en", sa.String(length=200), nullable=True),
        sa.Column("title_en", sa.String(length=240), nullable=True),
        sa.Column("points_en", sa.JSON(), nullable=True),
        sa.Column("exercise_en", sa.Text(), nullable=True),
    ],
    "question_categories": [
        sa.Column("title_en", sa.String(length=160), nullable=True),
    ],
    "questions": [
        sa.Column("question_en", sa.Text(), nullable=True),
        sa.Column("answer_en", sa.Text(), nullable=True),
    ],
    "know_me_questions": [
        sa.Column("label_en", sa.String(length=300), nullable=True),
    ],
    "servants": [
        sa.Column("name_en", sa.String(length=160), nullable=True),
    ],
    "notifications": [
        sa.Column("title_en", sa.String(length=240), nullable=True),
        sa.Column("body_en", sa.Text(), nullable=True),
    ],
    "conversation_messages": [
        sa.Column(
            "is_anonymous",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    ],
}


def _column_names(table_name: str) -> set[str]:
    return {
        str(column["name"])
        for column in sa.inspect(op.get_bind()).get_columns(table_name)
    }


def upgrade() -> None:
    for table_name, columns in LOCALIZED_COLUMNS.items():
        existing = _column_names(table_name)
        for column in columns:
            if column.name not in existing:
                op.add_column(table_name, column)
    op.execute(
        sa.text(
            "UPDATE conversation_messages SET is_anonymous = true "
            "WHERE sender_name IN ('مجهول الهوية', 'Anonymous')"
        )
    )


def downgrade() -> None:
    for table_name, columns in reversed(LOCALIZED_COLUMNS.items()):
        existing = _column_names(table_name)
        for column in reversed(columns):
            if column.name in existing:
                op.drop_column(table_name, column.name)
