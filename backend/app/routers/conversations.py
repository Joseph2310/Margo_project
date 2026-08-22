from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy import or_, select, update
from sqlalchemy.orm import Session, joinedload

from app.database import SessionLocal, get_db
from app.dependencies import get_current_user
from app.exceptions import AppError, error_body
from app.models import (
    Conversation,
    ConversationKind,
    ConversationMessage,
    ConversationStatus,
    MessageDeliveryStatus,
    SenderKind,
    User,
    utcnow,
)
from app.realtime import chat_manager
from app.schemas import (
    ConversationMessageResponse,
    ConversationResponse,
    MarkConversationReadResponse,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse,
)
from app.security import decode_jwt


router = APIRouter(prefix="/conversations", tags=["Conversations"])


def serialize_message(
    message: ConversationMessage, current_user_id: str
) -> ConversationMessageResponse:
    return ConversationMessageResponse(
        id=message.id,
        sender=message.sender,
        sender_name=message.sender_name,
        kind=message.kind,
        content=message.content,
        created_at=message.created_at,
        is_mine=message.sender_user_id == current_user_id,
        status=message.status,
        delivered_at=message.delivered_at,
        read_at=message.read_at,
    )


def serialize_conversation(
    conversation: Conversation, current_user_id: str
) -> ConversationResponse:
    servant_name = (
        conversation.servant.name if conversation.servant else "خادمات مدارس الأحد"
    )
    last_message = conversation.messages[-1] if conversation.messages else None
    preview = ""
    if last_message:
        prefix = "انت : " if last_message.sender_user_id == current_user_id else ""
        preview = f"{prefix}{last_message.content}"
    return ConversationResponse(
        id=conversation.id,
        servant_name=servant_name,
        preview=preview,
        messages=[
            serialize_message(item, current_user_id) for item in conversation.messages
        ],
        status=conversation.status,
        kind=conversation.kind,
    )


def accessible_conversation(
    db: Session, user: User, conversation_id: str
) -> Conversation:
    statement = select(Conversation).options(
        joinedload(Conversation.servant), joinedload(Conversation.messages)
    )
    if conversation_id == "all":
        statement = statement.where(
            Conversation.id == "all",
            Conversation.kind == ConversationKind.HOUSE,
        )
    else:
        statement = statement.where(
            Conversation.id == conversation_id,
            Conversation.kind == ConversationKind.DIRECT,
            Conversation.beneficiary_user_id == user.id,
        )
    conversation = db.execute(statement).unique().scalar_one_or_none()
    if not conversation or conversation.status == ConversationStatus.DELETED:
        raise AppError(404, "conversation_not_found", "The conversation was not found.")
    return conversation


def require_direct_conversation(conversation: Conversation) -> None:
    if conversation.kind != ConversationKind.DIRECT:
        raise AppError(
            403,
            "house_conversation_managed",
            "The shared house conversation cannot be blocked or removed.",
        )


async def conversation_audience(conversation: Conversation) -> set[str]:
    if conversation.kind == ConversationKind.HOUSE:
        return await chat_manager.connected_user_ids()
    return (
        {conversation.beneficiary_user_id}
        if conversation.beneficiary_user_id
        else set()
    )


def message_event(
    conversation_id: str, message: ConversationMessage, current_user_id: str
) -> dict[str, Any]:
    return {
        "type": "message.created",
        "data": {
            "conversationId": conversation_id,
            "message": serialize_message(message, current_user_id).model_dump(
                mode="json", by_alias=True
            ),
        },
    }


def status_event(
    conversation_id: str, message: ConversationMessage
) -> dict[str, Any]:
    return {
        "type": "message.status",
        "data": {
            "conversationId": conversation_id,
            "messageId": message.id,
            "status": message.status.value,
            "deliveredAt": (
                message.delivered_at.isoformat() if message.delivered_at else None
            ),
            "readAt": message.read_at.isoformat() if message.read_at else None,
        },
    }


@router.websocket("/ws")
async def conversation_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    connection = None
    user_id = ""
    try:
        try:
            auth_event = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        except asyncio.TimeoutError:
            await websocket.send_json(
                {
                    "type": "chat.error",
                    "data": error_body(
                        "Authentication was not provided in time.",
                        "authentication_timeout",
                    ),
                }
            )
            await websocket.close(code=4408)
            return
        if (
            not isinstance(auth_event, dict)
            or auth_event.get("type") != "authenticate"
            or not isinstance(auth_event.get("accessToken"), str)
        ):
            await websocket.send_json(
                {
                    "type": "chat.error",
                    "data": error_body(
                        "Send a valid authenticate event first.",
                        "authentication_required",
                    ),
                }
            )
            await websocket.close(code=4401)
            return

        try:
            token_payload = decode_jwt(auth_event["accessToken"], "access")
            with SessionLocal() as db:
                user = db.get(User, str(token_payload.get("sub", "")))
                if not user or not user.is_active or not user.is_verified:
                    raise AppError(
                        401, "account_unavailable", "The account is unavailable."
                    )
                user_id = user.id
        except AppError as exc:
            await websocket.send_json(
                {
                    "type": "chat.error",
                    "data": error_body(exc.message, exc.code, exc.field_errors),
                }
            )
            await websocket.close(code=4401)
            return

        connection = await chat_manager.add(user_id, websocket)
        await chat_manager.send_connection(
            connection,
            {
                "type": "chat.connected",
                "data": {
                    "connectedAt": datetime.now(timezone.utc).isoformat(),
                },
            },
        )

        while True:
            event = await websocket.receive_json()
            if isinstance(event, dict) and event.get("type") == "ping":
                await chat_manager.send_connection(
                    connection,
                    {
                        "type": "pong",
                        "data": {"timestamp": datetime.now(timezone.utc).isoformat()},
                    },
                )
            else:
                await chat_manager.send_connection(
                    connection,
                    {
                        "type": "chat.error",
                        "data": error_body(
                            "The real-time event is not supported.",
                            "unsupported_realtime_event",
                        ),
                    },
                )
    except (WebSocketDisconnect, RuntimeError, ValueError):
        pass
    finally:
        if connection is not None:
            await chat_manager.remove(user_id, connection)


@router.get(
    "",
    response_model=list[ConversationResponse],
    summary="List my active private conversations",
)
def list_conversations(
    search: str | None = Query(default=None, max_length=160),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConversationResponse]:
    statement = (
        select(Conversation)
        .options(joinedload(Conversation.servant), joinedload(Conversation.messages))
        .where(
            Conversation.beneficiary_user_id == user.id,
            Conversation.kind == ConversationKind.DIRECT,
            Conversation.status != ConversationStatus.DELETED,
            Conversation.servant_id.is_not(None),
        )
        .order_by(Conversation.updated_at.desc())
    )
    if search and search.strip():
        text = f"%{search.strip()}%"
        statement = statement.where(
            Conversation.messages.any(ConversationMessage.content.ilike(text))
        )
    conversations = db.execute(statement).unique().scalars().all()
    return [serialize_conversation(item, user.id) for item in conversations]


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get an authorized conversation and its message history",
)
def get_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationResponse:
    return serialize_conversation(
        accessible_conversation(db, user, conversation_id), user.id
    )


@router.post(
    "/messages",
    response_model=SendMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Persist and deliver a text, image, or voice message",
)
async def send_message(
    payload: SendMessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SendMessageResponse:
    conversation_id = payload.conversation_id or "all"
    conversation = accessible_conversation(db, user, conversation_id)
    if conversation.status == ConversationStatus.BLOCKED:
        raise AppError(409, "conversation_blocked", "The conversation is blocked.")
    sender_name = "مجهول الهوية" if payload.anonymous else user.profile.name
    message = ConversationMessage(
        conversation_id=conversation.id,
        sender_user_id=user.id,
        sender=SenderKind.BENEFICIARY,
        sender_name=sender_name,
        kind=payload.kind,
        content=payload.content.strip(),
        status=MessageDeliveryStatus.SENT,
    )
    conversation.updated_at = utcnow()
    db.add(message)
    db.commit()
    db.refresh(message)

    audience = await conversation_audience(conversation)
    delivered_to = await chat_manager.send_to_users(
        audience,
        lambda recipient_id: message_event(conversation.id, message, recipient_id),
    )
    if delivered_to - {user.id}:
        delivered_at = utcnow()
        db.execute(
            update(ConversationMessage)
            .where(
                ConversationMessage.id == message.id,
                ConversationMessage.status == MessageDeliveryStatus.SENT,
            )
            .values(
                status=MessageDeliveryStatus.DELIVERED,
                delivered_at=delivered_at,
            )
        )
        db.commit()
        db.refresh(message)
        await chat_manager.send_to_users(
            audience, lambda _: status_event(conversation.id, message)
        )

    return SendMessageResponse(
        conversation_id=conversation.id,
        message=serialize_message(message, user.id),
    )


@router.post(
    "/{conversation_id}/read",
    response_model=MarkConversationReadResponse,
    summary="Mark messages from other participants as read",
)
async def mark_conversation_read(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarkConversationReadResponse:
    conversation = accessible_conversation(db, user, conversation_id)
    messages = db.scalars(
        select(ConversationMessage).where(
            ConversationMessage.conversation_id == conversation.id,
            or_(
                ConversationMessage.sender_user_id.is_(None),
                ConversationMessage.sender_user_id != user.id,
            ),
            ConversationMessage.status != MessageDeliveryStatus.READ,
        )
    ).all()
    if not messages:
        return MarkConversationReadResponse(updated_count=0)

    read_at = utcnow()
    for message in messages:
        message.status = MessageDeliveryStatus.READ
        message.delivered_at = message.delivered_at or read_at
        message.read_at = read_at
    db.commit()

    audience = await conversation_audience(conversation)
    for message in messages:
        await chat_manager.send_to_users(
            audience, lambda _, item=message: status_event(conversation.id, item)
        )
    return MarkConversationReadResponse(updated_count=len(messages))


@router.delete(
    "/{conversation_id}",
    response_model=MessageResponse,
    summary="Remove a private conversation from my list",
)
def delete_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    conversation = accessible_conversation(db, user, conversation_id)
    require_direct_conversation(conversation)
    conversation.status = ConversationStatus.DELETED
    db.commit()
    return MessageResponse(message="Conversation removed successfully.")


@router.post(
    "/{conversation_id}/block",
    response_model=MessageResponse,
    summary="Block a private servant conversation",
)
def block_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    conversation = accessible_conversation(db, user, conversation_id)
    require_direct_conversation(conversation)
    conversation.status = ConversationStatus.BLOCKED
    db.commit()
    return MessageResponse(message="Conversation blocked successfully.")
