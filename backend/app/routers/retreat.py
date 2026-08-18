from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import (
    ActivityCompletion,
    ReflectionCompletion,
    ReflectionLesson,
    RetreatSubmission,
    SpiritualActivity,
    User,
)
from app.schemas import (
    MessageResponse,
    ReflectionLessonResponse,
    RetreatSubmissionRequest,
    SpiritualActivityResponse,
    SubmissionResult,
)


router = APIRouter(prefix="/retreat", tags=["Retreat and Reflection"])


@router.get(
    "/activities",
    response_model=list[SpiritualActivityResponse],
    summary="List active spiritual activities",
)
def list_activities(
    _: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[SpiritualActivityResponse]:
    activities = db.scalars(
        select(SpiritualActivity)
        .where(SpiritualActivity.is_active.is_(True))
        .order_by(SpiritualActivity.sort_order)
    ).all()
    return [SpiritualActivityResponse.model_validate(item) for item in activities]


@router.post(
    "/submissions",
    response_model=SubmissionResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit today's retreat activities and reflection",
)
def submit_retreat(
    payload: RetreatSubmissionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubmissionResult:
    today = date.today()
    unique_ids = list(dict.fromkeys(payload.activity_ids))
    activities = list(
        db.scalars(
            select(SpiritualActivity).where(
                SpiritualActivity.id.in_(unique_ids),
                SpiritualActivity.is_active.is_(True),
            )
        ).all()
    )
    if len(activities) != len(unique_ids):
        raise AppError(400, "invalid_activity", "One or more activities are unavailable.")

    existing_ids = set(
        db.scalars(
            select(ActivityCompletion.activity_id).where(
                ActivityCompletion.user_id == user.id,
                ActivityCompletion.completion_date == today,
                ActivityCompletion.activity_id.in_(unique_ids),
            )
        ).all()
    )
    awarded = 0
    for activity in activities:
        if activity.id in existing_ids:
            continue
        points = activity.points or 0
        awarded += points
        db.add(
            ActivityCompletion(
                user_id=user.id,
                activity_id=activity.id,
                completion_date=today,
                points_awarded=points,
            )
        )

    submission = db.scalar(
        select(RetreatSubmission).where(
            RetreatSubmission.user_id == user.id,
            RetreatSubmission.submission_date == today,
        )
    )
    if not submission:
        submission = RetreatSubmission(
            user_id=user.id,
            submission_date=today,
            activity_ids=unique_ids,
            reflection=(payload.reflection or "").strip() or None,
            points_awarded=awarded,
        )
        db.add(submission)
    else:
        submission.activity_ids = list(
            dict.fromkeys([*submission.activity_ids, *unique_ids])
        )
        if payload.reflection and payload.reflection.strip():
            submission.reflection = payload.reflection.strip()
        submission.points_awarded += awarded
    user.profile.points += awarded
    db.commit()
    return SubmissionResult(
        id=submission.id,
        points_awarded=awarded,
        total_points=user.profile.points,
        message="Retreat progress submitted successfully.",
    )


@router.get(
    "/reflection/latest",
    response_model=ReflectionLessonResponse | None,
    summary="Get the latest published reflection lesson",
)
def get_latest_reflection(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ReflectionLessonResponse | None:
    lesson = db.scalar(
        select(ReflectionLesson)
        .where(ReflectionLesson.is_published.is_(True))
        .order_by(ReflectionLesson.published_at.desc())
    )
    if not lesson:
        return None
    completed = db.scalar(
        select(ReflectionCompletion.id).where(
            ReflectionCompletion.user_id == user.id,
            ReflectionCompletion.lesson_id == lesson.id,
        )
    )
    return ReflectionLessonResponse(
        id=lesson.id,
        date=lesson.date_label,
        title=lesson.title,
        points=lesson.points,
        exercise=lesson.exercise,
        exercise_points=lesson.exercise_points,
        completed=bool(completed),
    )


@router.post(
    "/reflection/{lesson_id}/complete",
    response_model=SubmissionResult,
    status_code=status.HTTP_201_CREATED,
    summary="Complete a reflection exercise and award points once",
)
def complete_reflection(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubmissionResult:
    lesson = db.get(ReflectionLesson, lesson_id)
    if not lesson or not lesson.is_published:
        raise AppError(404, "reflection_not_found", "The reflection lesson was not found.")
    existing = db.scalar(
        select(ReflectionCompletion).where(
            ReflectionCompletion.user_id == user.id,
            ReflectionCompletion.lesson_id == lesson.id,
        )
    )
    if existing:
        raise AppError(409, "reflection_already_completed", "The exercise is already completed.")
    awarded = lesson.exercise_points or 0
    completion = ReflectionCompletion(
        user_id=user.id, lesson_id=lesson.id, points_awarded=awarded
    )
    db.add(completion)
    user.profile.points += awarded
    db.commit()
    return SubmissionResult(
        id=completion.id,
        points_awarded=awarded,
        total_points=user.profile.points,
        message="Reflection exercise completed successfully.",
    )
