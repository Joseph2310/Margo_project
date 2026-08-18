from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
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


def serialize_event(event: Event) -> BeneficiaryEventResponse:
    return BeneficiaryEventResponse(
        id=event.id,
        name=event.name,
        date_label=event.date_label,
        time_label=event.time_label,
        location=event.location,
        icon=event.icon,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
    )


def serialize_reading(reading: DailyReading) -> DailyReadingResponse:
    return DailyReadingResponse(
        id=reading.id,
        date=reading.date_label,
        reference=reading.reference,
        title=reading.title,
        content=reading.content,
    )


def asked_at_label(asked_at: date) -> str:
    days = (date.today() - asked_at).days
    if days <= 0:
        return ""
    if days == 1:
        return "منذ يوم"
    if days == 2:
        return "منذ يومين"
    return f"منذ {days} أيام"


def serialize_know_me(
    question: KnowMeQuestion,
    answered_ids: set[str],
    current_question_id: str | None,
) -> KnowMeQuestionResponse:
    return KnowMeQuestionResponse(
        id=question.id,
        label=question.label,
        asked_at=asked_at_label(question.asked_at),
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
    return [serialize_event(event) for event in events]


@router.get(
    "/readings/today",
    response_model=DailyReadingResponse | None,
    summary="Get today's daily reading, or the latest published reading",
)
def get_daily_reading(
    _: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> DailyReadingResponse | None:
    reading = db.scalar(
        select(DailyReading)
        .where(DailyReading.is_published.is_(True))
        .order_by(DailyReading.reading_date.desc())
    )
    return serialize_reading(reading) if reading else None


@router.get(
    "/home",
    response_model=HomeDashboardResponse,
    summary="Get the authenticated beneficiary home dashboard",
)
def get_home(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
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
        upcoming_events=[serialize_event(event) for event in events],
        daily_reading=serialize_reading(reading) if reading else None,
        question_categories=[
            QuestionCategoryResponse.model_validate(category) for category in categories
        ],
        know_me_questions=[
            serialize_know_me(question, answered_ids, current_question_id)
            for question in know_me
        ],
    )
