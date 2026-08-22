"""Add shared real-time chat persistence fields.

Revision ID: 20260822_0002
Revises: 20260817_0001
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260822_0002"
down_revision: str | None = "20260817_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _columns(table_name: str) -> dict[str, dict[str, object]]:
    return {
        str(column["name"]): column
        for column in sa.inspect(op.get_bind()).get_columns(table_name)
    }


def _index_names(table_name: str) -> set[str]:
    return {
        str(index["name"])
        for index in sa.inspect(op.get_bind()).get_indexes(table_name)
        if index.get("name")
    }


def _foreign_key_names(table_name: str) -> set[str]:
    return {
        str(key["name"])
        for key in sa.inspect(op.get_bind()).get_foreign_keys(table_name)
        if key.get("name")
    }


def _has_foreign_key(table_name: str, columns: list[str]) -> bool:
    return any(
        key.get("constrained_columns") == columns
        for key in sa.inspect(op.get_bind()).get_foreign_keys(table_name)
    )


def upgrade() -> None:
    conversation_columns = _columns("conversations")
    if "kind" not in conversation_columns:
        op.add_column(
            "conversations",
            sa.Column(
                "kind",
                sa.String(length=24),
                nullable=False,
                server_default="DIRECT",
            ),
        )
    if not bool(conversation_columns["beneficiary_user_id"]["nullable"]):
        op.alter_column(
            "conversations",
            "beneficiary_user_id",
            existing_type=sa.String(length=36),
            nullable=True,
        )

    message_columns = _columns("conversation_messages")
    if "sender_user_id" not in message_columns:
        op.add_column(
            "conversation_messages",
            sa.Column("sender_user_id", sa.String(length=36), nullable=True),
        )
    if "status" not in message_columns:
        op.add_column(
            "conversation_messages",
            sa.Column(
                "status",
                sa.String(length=24),
                nullable=False,
                server_default="SENT",
            ),
        )
    if "delivered_at" not in message_columns:
        op.add_column(
            "conversation_messages",
            sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        )
    if "read_at" not in message_columns:
        op.add_column(
            "conversation_messages",
            sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_foreign_key("conversation_messages", ["sender_user_id"]):
        op.create_foreign_key(
            "fk_conversation_messages_sender_user_id_users",
            "conversation_messages",
            "users",
            ["sender_user_id"],
            ["id"],
            ondelete="SET NULL",
        )
    if "ix_conversation_messages_sender_user_id" not in _index_names(
        "conversation_messages"
    ):
        op.create_index(
            "ix_conversation_messages_sender_user_id",
            "conversation_messages",
            ["sender_user_id"],
        )

    op.execute(
        sa.text(
            """
            UPDATE conversation_messages AS message
            SET sender_user_id = conversation.beneficiary_user_id
            FROM conversations AS conversation
            WHERE message.conversation_id = conversation.id
              AND lower(message.sender) = 'beneficiary'
              AND message.sender_user_id IS NULL
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE conversations
            SET kind = 'HOUSE', beneficiary_user_id = NULL
            WHERE id = 'all'
            """
        )
    )


def downgrade() -> None:
    message_columns = _columns("conversation_messages")
    if "read_at" in message_columns:
        op.drop_column("conversation_messages", "read_at")
    if "delivered_at" in message_columns:
        op.drop_column("conversation_messages", "delivered_at")
    if "status" in message_columns:
        op.drop_column("conversation_messages", "status")
    if "sender_user_id" in message_columns:
        if "ix_conversation_messages_sender_user_id" in _index_names(
            "conversation_messages"
        ):
            op.drop_index(
                "ix_conversation_messages_sender_user_id",
                table_name="conversation_messages",
            )
        if "fk_conversation_messages_sender_user_id_users" in _foreign_key_names(
            "conversation_messages"
        ):
            op.drop_constraint(
                "fk_conversation_messages_sender_user_id_users",
                "conversation_messages",
                type_="foreignkey",
            )
        op.drop_column("conversation_messages", "sender_user_id")

    conversation_columns = _columns("conversations")
    if "kind" in conversation_columns:
        op.drop_column("conversations", "kind")
    op.execute(
        sa.text(
            """
            UPDATE conversations
            SET beneficiary_user_id = (
                SELECT id FROM users ORDER BY created_at LIMIT 1
            )
            WHERE beneficiary_user_id IS NULL
            """
        )
    )
    op.alter_column(
        "conversations",
        "beneficiary_user_id",
        existing_type=sa.String(length=36),
        nullable=False,
    )
