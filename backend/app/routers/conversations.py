from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import (
    Conversation,
    ConversationMessage,
    ConversationStatus,
    SenderKind,
    User,
)
from app.schemas import (
    ConversationMessageResponse,
    ConversationResponse,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse,
)


router = APIRouter(prefix="/conversations", tags=["Conversations"])


def serialize_message(message: ConversationMessage) -> ConversationMessageResponse:
    return ConversationMessageResponse.model_validate(message)


def serialize_conversation(conversation: Conversation) -> ConversationResponse:
    servant_name = (
        conversation.servant.name if conversation.servant else "خادمات مدارس الأحد"
    )
    last_message = conversation.messages[-1] if conversation.messages else None
    preview = ""
    if last_message:
        prefix = "انت : " if last_message.sender == SenderKind.BENEFICIARY else ""
        preview = f"{prefix}{last_message.content}"
    return ConversationResponse(
        id=conversation.id,
        servant_name=servant_name,
        preview=preview,
        messages=[serialize_message(item) for item in conversation.messages],
        status=conversation.status,
    )


def owned_conversation(db: Session, user: User, conversation_id: str) -> Conversation:
    statement = (
        select(Conversation)
        .options(joinedload(Conversation.servant), joinedload(Conversation.messages))
        .where(
            Conversation.beneficiary_user_id == user.id,
        )
    )
    if conversation_id == "all":
        statement = statement.where(Conversation.servant_id.is_(None))
    else:
        statement = statement.where(Conversation.id == conversation_id)
    conversation = db.execute(statement).unique().scalar_one_or_none()
    if not conversation or conversation.status == ConversationStatus.DELETED:
        raise AppError(404, "conversation_not_found", "The conversation was not found.")
    return conversation


@router.get(
    "",
    response_model=list[ConversationResponse],
    summary="List my active conversations",
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
    return [serialize_conversation(item) for item in conversations]


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get one conversation and its messages",
)
def get_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationResponse:
    return serialize_conversation(owned_conversation(db, user, conversation_id))


@router.post(
    "/messages",
    response_model=SendMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a text, image, or voice message",
)
def send_message(
    payload: SendMessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SendMessageResponse:
    conversation_id = payload.conversation_id or "all"
    conversation = owned_conversation(db, user, conversation_id)
    if conversation.status == ConversationStatus.BLOCKED:
        raise AppError(409, "conversation_blocked", "The conversation is blocked.")
    sender_name = "مجهول الهوية" if payload.anonymous else user.profile.name
    message = ConversationMessage(
        conversation_id=conversation.id,
        sender=SenderKind.BENEFICIARY,
        sender_name=sender_name,
        kind=payload.kind,
        content=payload.content.strip(),
    )
    db.add(message)
    db.commit()
    return SendMessageResponse(
        conversation_id=conversation.id,
        message=serialize_message(message),
    )


@router.delete(
    "/{conversation_id}",
    response_model=MessageResponse,
    summary="Remove a conversation from my list",
)
def delete_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    conversation = owned_conversation(db, user, conversation_id)
    conversation.status = ConversationStatus.DELETED
    db.commit()
    return MessageResponse(message="Conversation removed successfully.")


@router.post(
    "/{conversation_id}/block",
    response_model=MessageResponse,
    summary="Block a servant conversation",
)
def block_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    conversation = owned_conversation(db, user, conversation_id)
    conversation.status = ConversationStatus.BLOCKED
    db.commit()
    return MessageResponse(message="Conversation blocked successfully.")
