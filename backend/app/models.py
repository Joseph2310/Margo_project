from __future__ import annotations

import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class VerificationPurpose(str, enum.Enum):
    ACTIVATION = "activation"
    REGISTRATION = "registration"
    PASSWORD_RESET = "passwordReset"


class ProposalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SenderKind(str, enum.Enum):
    BENEFICIARY = "beneficiary"
    SERVANT = "servant"


class MessageKind(str, enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    VOICE = "voice"


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    DELETED = "deleted"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile: Mapped[BeneficiaryProfile] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    refresh_sessions: Mapped[list[RefreshSession]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class BeneficiaryProfile(TimestampMixin, Base):
    __tablename__ = "beneficiary_profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(160))
    birth_date: Mapped[str] = mapped_column(String(80))
    stage: Mapped[str] = mapped_column(String(120))
    address: Mapped[str] = mapped_column(String(500))
    phone: Mapped[str] = mapped_column(String(40))
    whatsapp: Mapped[str] = mapped_column(String(40))
    school: Mapped[str] = mapped_column(String(240))
    class_saint_name: Mapped[str] = mapped_column(String(240))
    confession_father: Mapped[str | None] = mapped_column(String(240), nullable=True)
    talents: Mapped[list[str]] = mapped_column(JSON, default=list)
    points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attendance_qr_value: Mapped[str] = mapped_column(String(255), unique=True)
    avatar_uri: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    user: Mapped[User] = relationship(back_populates="profile")


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), index=True)
    purpose: Mapped[VerificationPurpose] = mapped_column(
        Enum(VerificationPurpose, native_enum=False, length=32), index=True
    )
    code_hash: Mapped[str] = mapped_column(String(255))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    consumed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class RefreshSession(Base):
    __tablename__ = "refresh_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="refresh_sessions")


class Event(TimestampMixin, Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(240))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    date_label: Mapped[str] = mapped_column(String(160))
    time_label: Mapped[str] = mapped_column(String(160))
    location: Mapped[str] = mapped_column(String(500))
    icon: Mapped[str] = mapped_column(String(80))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class DailyReading(TimestampMixin, Base):
    __tablename__ = "daily_readings"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    reading_date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    date_label: Mapped[str] = mapped_column(String(160))
    reference: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(160))
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class SpiritualActivity(TimestampMixin, Base):
    __tablename__ = "spiritual_activities"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    title: Mapped[str] = mapped_column(String(240))
    points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ActivityCompletion(Base):
    __tablename__ = "activity_completions"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "activity_id", "completion_date", name="uq_activity_day"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    activity_id: Mapped[str] = mapped_column(
        ForeignKey("spiritual_activities.id"), index=True
    )
    completion_date: Mapped[date] = mapped_column(Date, index=True)
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class RetreatSubmission(Base):
    __tablename__ = "retreat_submissions"
    __table_args__ = (
        UniqueConstraint("user_id", "submission_date", name="uq_retreat_day"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    submission_date: Mapped[date] = mapped_column(Date, index=True)
    activity_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    reflection: Mapped[str | None] = mapped_column(Text, nullable=True)
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class ReflectionLesson(TimestampMixin, Base):
    __tablename__ = "reflection_lessons"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    date_label: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(240))
    points: Mapped[list[str]] = mapped_column(JSON, default=list)
    exercise: Mapped[str] = mapped_column(Text)
    exercise_points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class ReflectionCompletion(Base):
    __tablename__ = "reflection_completions"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_reflection_completion"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    lesson_id: Mapped[str] = mapped_column(
        ForeignKey("reflection_lessons.id"), index=True
    )
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class QuestionCategory(TimestampMixin, Base):
    __tablename__ = "question_categories"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    icon: Mapped[str] = mapped_column(String(80))
    color: Mapped[str] = mapped_column(String(40))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Question(TimestampMixin, Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    category_id: Mapped[str] = mapped_column(
        ForeignKey("question_categories.id"), index=True
    )
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class QuestionProposal(Base):
    __tablename__ = "question_proposals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    question: Mapped[str] = mapped_column(Text)
    status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus, native_enum=False, length=24),
        default=ProposalStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class KnowMeQuestion(TimestampMixin, Base):
    __tablename__ = "know_me_questions"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    label: Mapped[str] = mapped_column(String(300))
    asked_at: Mapped[date] = mapped_column(Date, index=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class KnowMeAnswer(Base):
    __tablename__ = "know_me_answers"
    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_know_me_answer"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    question_id: Mapped[str] = mapped_column(
        ForeignKey("know_me_questions.id"), index=True
    )
    answer: Mapped[str] = mapped_column(Text)
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class Servant(TimestampMixin, Base):
    __tablename__ = "servants"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Conversation(TimestampMixin, Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=new_id)
    beneficiary_user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    servant_id: Mapped[str | None] = mapped_column(
        ForeignKey("servants.id"), nullable=True, index=True
    )
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus, native_enum=False, length=24),
        default=ConversationStatus.ACTIVE,
    )

    servant: Mapped[Servant | None] = relationship()
    messages: Mapped[list[ConversationMessage]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.created_at",
    )


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    sender: Mapped[SenderKind] = mapped_column(
        Enum(SenderKind, native_enum=False, length=24)
    )
    sender_name: Mapped[str] = mapped_column(String(160))
    kind: Mapped[MessageKind] = mapped_column(
        Enum(MessageKind, native_enum=False, length=24)
    )
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    conversation: Mapped[Conversation] = relationship(back_populates="messages")


class Suggestion(Base):
    __tablename__ = "suggestions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    general_suggestion: Mapped[str] = mapped_column(Text, default="")
    lesson_suggestion: Mapped[str] = mapped_column(Text, default="")
    hymn_suggestion: Mapped[str] = mapped_column(Text, default="")
    hymn_rating: Mapped[int] = mapped_column(Integer, default=0)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(240))
    body: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
