from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models import (
    ConversationKind,
    ConversationStatus,
    MessageDeliveryStatus,
    MessageKind,
    ProposalStatus,
    SenderKind,
    VerificationPurpose,
)


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MessageResponse(ApiModel):
    message: str


class ApiError(ApiModel):
    message: str
    code: str
    field_errors: dict[str, str] | None = None


class HealthResponse(ApiModel):
    status: str
    database: str
    version: str


class PasswordFields(ApiModel):
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password(self) -> PasswordFields:
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if not re.search(r"[0-9]", self.password):
            raise ValueError("Password must contain a number")
        if not re.search(r"[A-Z]", self.password):
            raise ValueError("Password must contain an uppercase letter")
        return self


class RegistrationRequest(PasswordFields):
    name: str = Field(min_length=1, max_length=160)
    birth_date: str = Field(min_length=1, max_length=80)
    stage: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=1, max_length=500)
    phone: str = Field(min_length=3, max_length=40)
    whatsapp: str = Field(min_length=3, max_length=40)
    school: str = Field(min_length=1, max_length=240)
    class_saint_name: str = Field(min_length=1, max_length=240)
    confession_father: str | None = Field(default=None, max_length=240)
    talents: list[str] = Field(default_factory=list, max_length=30)
    email: EmailStr


class LoginRequest(ApiModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class VerificationRequest(ApiModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")
    mode: VerificationPurpose


class ResendVerificationRequest(ApiModel):
    email: EmailStr
    mode: VerificationPurpose


class ForgotPasswordRequest(ApiModel):
    email: EmailStr


class ResetPasswordRequest(PasswordFields):
    email: EmailStr
    reset_token: str = Field(min_length=20)


class ChangePasswordRequest(PasswordFields):
    current_password: str = Field(min_length=1, max_length=128)


class RefreshTokenRequest(ApiModel):
    refresh_token: str = Field(min_length=20)


class LogoutRequest(ApiModel):
    refresh_token: str = Field(min_length=20)


class AuthSession(ApiModel):
    is_authenticated: bool = True
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    beneficiary_id: str


class VerificationChallenge(ApiModel):
    email: EmailStr
    mode: VerificationPurpose
    expires_in_seconds: int
    message: str
    verification_code: str | None = Field(
        default=None,
        description="Development-only code. Omitted when EXPOSE_VERIFICATION_CODE=false.",
    )


class VerificationResult(ApiModel):
    mode: VerificationPurpose
    session: AuthSession | None = None
    password_reset_token: str | None = None
    expires_in: int | None = None


class BeneficiaryProfileResponse(ApiModel):
    id: str
    name: str
    birth_date: str
    stage: str
    address: str
    phone: str
    whatsapp: str
    school: str
    class_saint_name: str
    confession_father: str | None = None
    talents: list[str]
    email: EmailStr
    points: int
    attendance_qr_value: str
    avatar_uri: str | None = None


class BeneficiaryProfileUpdate(ApiModel):
    name: str = Field(min_length=1, max_length=160)
    birth_date: str = Field(min_length=1, max_length=80)
    stage: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=1, max_length=500)
    phone: str = Field(min_length=3, max_length=40)
    whatsapp: str = Field(min_length=3, max_length=40)
    school: str = Field(min_length=1, max_length=240)
    class_saint_name: str = Field(min_length=1, max_length=240)
    confession_father: str | None = Field(default=None, max_length=240)
    talents: list[str] = Field(default_factory=list, max_length=30)
    email: EmailStr
    avatar_uri: str | None = Field(default=None, max_length=1000)


class WhatsAppGroupResponse(ApiModel):
    url: str


class BeneficiaryEventResponse(ApiModel):
    id: str
    name: str
    date_label: str
    time_label: str
    location: str
    icon: str
    starts_at: datetime
    ends_at: datetime


class DailyReadingResponse(ApiModel):
    id: str
    date: str
    reference: str
    title: str
    content: str | None = None


class SpiritualActivityResponse(ApiModel):
    id: str
    title: str
    points: int | None = None
    description: str | None = None


class RetreatSubmissionRequest(ApiModel):
    activity_ids: list[str] = Field(default_factory=list, max_length=50)
    reflection: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def require_content(self) -> RetreatSubmissionRequest:
        if not self.activity_ids and not (self.reflection or "").strip():
            raise ValueError("Select an activity or provide a reflection")
        return self


class SubmissionResult(ApiModel):
    id: str
    points_awarded: int
    total_points: int
    message: str


class ReflectionLessonResponse(ApiModel):
    id: str
    date: str
    title: str
    points: list[str]
    exercise: str
    exercise_points: int | None = None
    completed: bool = False


class QuestionCategoryResponse(ApiModel):
    id: str
    title: str
    icon: str
    color: str


class QuestionAnswerResponse(ApiModel):
    id: str
    category_id: str
    question: str
    answer: str


class QuestionProposalRequest(ApiModel):
    question: str = Field(min_length=3, max_length=2000)


class QuestionProposalResponse(ApiModel):
    id: str
    status: ProposalStatus
    message: str


class KnowMeQuestionResponse(ApiModel):
    id: str
    label: str
    asked_at: str
    is_today: bool
    points: int
    answered: bool = False


class KnowMeAnswerRequest(ApiModel):
    answer: str = Field(min_length=1, max_length=2000)


class HomeDashboardResponse(ApiModel):
    profile: BeneficiaryProfileResponse
    upcoming_events: list[BeneficiaryEventResponse]
    daily_reading: DailyReadingResponse | None
    question_categories: list[QuestionCategoryResponse]
    know_me_questions: list[KnowMeQuestionResponse]


class ConversationMessageResponse(ApiModel):
    id: str
    sender: SenderKind
    sender_name: str
    is_anonymous: bool
    kind: MessageKind
    content: str
    created_at: datetime
    is_mine: bool
    status: MessageDeliveryStatus
    delivered_at: datetime | None = None
    read_at: datetime | None = None


class ConversationResponse(ApiModel):
    id: str
    servant_name: str
    preview: str
    messages: list[ConversationMessageResponse]
    status: ConversationStatus
    kind: ConversationKind


class SendMessageRequest(ApiModel):
    conversation_id: str | None = None
    content: str = Field(min_length=1, max_length=10000)
    kind: MessageKind = MessageKind.TEXT
    anonymous: bool = False


class SendMessageResponse(ApiModel):
    conversation_id: str
    message: ConversationMessageResponse


class MarkConversationReadResponse(ApiModel):
    updated_count: int


class SuggestionRequest(ApiModel):
    general_suggestion: str = Field(default="", max_length=5000)
    lesson_suggestion: str = Field(default="", max_length=5000)
    hymn_suggestion: str = Field(default="", max_length=5000)
    hymn_rating: int = Field(default=0, ge=0, le=5)
    anonymous: bool = True

    @model_validator(mode="after")
    def require_suggestion(self) -> SuggestionRequest:
        has_text = any(
            value.strip()
            for value in (
                self.general_suggestion,
                self.lesson_suggestion,
                self.hymn_suggestion,
            )
        )
        if not has_text and self.hymn_rating == 0:
            raise ValueError("Provide at least one suggestion or rating")
        return self


class SuggestionResponse(ApiModel):
    id: str
    message: str


class NotificationResponse(ApiModel):
    id: str
    title: str
    body: str
    is_read: bool
    created_at: datetime
