from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.localization import Language, get_language, localized
from app.models import (
    DailyReading,
    Event,
    KnowMeAnswer,
    KnowMeQuestion,
    QuestionCategory,
    User,
)
from app.routers.profile import serialize_profile
from app.schemas import (
    BeneficiaryEventResponse,
    DailyReadingResponse,
    HomeDashboardResponse,
    KnowMeQuestionResponse,
    QuestionCategoryResponse,
)


router = APIRouter(tags=["Home and Content"])


def serialize_event(event: Event, language: Language) -> BeneficiaryEventResponse:
    return BeneficiaryEventResponse(
        id=event.id,
        name=localized(event.name, event.name_en, language),
        date_label=localized(event.date_label, event.date_label_en, language),
        time_label=localized(event.time_label, event.time_label_en, language),
        location=localized(event.location, event.location_en, language),
        icon=event.icon,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
    )


def serialize_reading(
    reading: DailyReading, language: Language
) -> DailyReadingResponse:
    return DailyReadingResponse(
        id=reading.id,
        date=localized(reading.date_label, reading.date_label_en, language),
        reference=localized(reading.reference, reading.reference_en, language),
        title=localized(reading.title, reading.title_en, language),
        content=localized(reading.content, reading.content_en, language),
    )


def serialize_category(
    category: QuestionCategory, language: Language
) -> QuestionCategoryResponse:
    return QuestionCategoryResponse(
        id=category.id,
        title=localized(category.title, category.title_en, language),
        icon=category.icon,
        color=category.color,
    )


def asked_at_label(asked_at: date, language: Language) -> str:
    days = (date.today() - asked_at).days
    if days <= 0:
        return ""
    if language == "en":
        return "1 day ago" if days == 1 else f"{days} days ago"
    if days == 1:
        return "منذ يوم"
    if days == 2:
        return "منذ يومين"
    return f"منذ {days} أيام"


def serialize_know_me(
    question: KnowMeQuestion,
    answered_ids: set[str],
    current_question_id: str | None,
    language: Language,
) -> KnowMeQuestionResponse:
    return KnowMeQuestionResponse(
        id=question.id,
        label=localized(question.label, question.label_en, language),
        asked_at=asked_at_label(question.asked_at, language),
        is_today=question.id == current_question_id,
        points=question.points,
        answered=question.id in answered_ids,
    )


def get_current_know_me_question_id(db: Session) -> str | None:
    """Return today's question, or keep the latest active question current."""
    return db.scalar(
        select(KnowMeQuestion.id)
        .where(
            KnowMeQuestion.is_active.is_(True),
            KnowMeQuestion.asked_at <= date.today(),
        )
        .order_by(KnowMeQuestion.asked_at.desc(), KnowMeQuestion.created_at.desc())
        .limit(1)
    )


@router.get(
    "/events",
    response_model=list[BeneficiaryEventResponse],
    summary="List upcoming published events",
)
def list_events(
    from_date: date | None = Query(default=None, alias="fromDate"),
    language: Language = Depends(get_language),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[BeneficiaryEventResponse]:
    start_date = from_date or date.today()
    threshold = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
    events = db.scalars(
        select(Event)
        .where(Event.is_published.is_(True), Event.ends_at >= threshold)
        .order_by(Event.starts_at)
    ).all()
    return [serialize_event(event, language) for event in events]


@router.get(
    "/readings/today",
    response_model=DailyReadingResponse | None,
    summary="Get today's daily reading, or the latest published reading",
)
def get_daily_reading(
    language: Language = Depends(get_language),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyReadingResponse | None:
    reading = db.scalar(
        select(DailyReading)
        .where(DailyReading.is_published.is_(True))
        .order_by(DailyReading.reading_date.desc())
    )
    return serialize_reading(reading, language) if reading else None


@router.get(
    "/home",
    response_model=HomeDashboardResponse,
    summary="Get the authenticated beneficiary home dashboard",
)
def get_home(
    language: Language = Depends(get_language),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HomeDashboardResponse:
    now = datetime.now(timezone.utc)
    events = db.scalars(
        select(Event)
        .where(Event.is_published.is_(True), Event.ends_at >= now)
        .order_by(Event.starts_at)
        .limit(3)
    ).all()
    reading = db.scalar(
        select(DailyReading)
        .where(DailyReading.is_published.is_(True))
        .order_by(DailyReading.reading_date.desc())
    )
    categories = db.scalars(
        select(QuestionCategory)
        .where(QuestionCategory.is_active.is_(True))
        .order_by(QuestionCategory.sort_order)
        .limit(6)
    ).all()
    know_me = db.scalars(
        select(KnowMeQuestion)
        .where(KnowMeQuestion.is_active.is_(True))
        .order_by(KnowMeQuestion.asked_at.desc())
        .limit(3)
    ).all()
    answered_ids = set(
        db.scalars(
            select(KnowMeAnswer.question_id).where(KnowMeAnswer.user_id == user.id)
        ).all()
    )
    current_question_id = get_current_know_me_question_id(db)
    return HomeDashboardResponse(
        profile=serialize_profile(user),
        upcoming_events=[serialize_event(event, language) for event in events],
        daily_reading=serialize_reading(reading, language) if reading else None,
        question_categories=[
            serialize_category(category, language) for category in categories
        ],
        know_me_questions=[
            serialize_know_me(
                question, answered_ids, current_question_id, language
            )
            for question in know_me
        ],
    )
