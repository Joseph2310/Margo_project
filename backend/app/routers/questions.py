from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import (
    KnowMeAnswer,
    KnowMeQuestion,
    Question,
    QuestionCategory,
    QuestionProposal,
    User,
)
from app.routers.content import get_current_know_me_question_id, serialize_know_me
from app.schemas import (
    KnowMeAnswerRequest,
    KnowMeQuestionResponse,
    QuestionAnswerResponse,
    QuestionCategoryResponse,
    QuestionProposalRequest,
    QuestionProposalResponse,
    SubmissionResult,
)


router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get(
    "/categories",
    response_model=list[QuestionCategoryResponse],
    summary="List active question-bank categories",
)
def list_categories(
    _: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[QuestionCategoryResponse]:
    categories = db.scalars(
        select(QuestionCategory)
        .where(QuestionCategory.is_active.is_(True))
        .order_by(QuestionCategory.sort_order)
    ).all()
    return [QuestionCategoryResponse.model_validate(item) for item in categories]


@router.get(
    "",
    response_model=list[QuestionAnswerResponse],
    summary="List published questions in one category",
)
def list_questions(
    category_id: str = Query(alias="categoryId"),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[QuestionAnswerResponse]:
    category = db.get(QuestionCategory, category_id)
    if not category or not category.is_active:
        raise AppError(404, "category_not_found", "The question category was not found.")
    questions = db.scalars(
        select(Question)
        .where(
            Question.category_id == category_id,
            Question.is_published.is_(True),
        )
        .order_by(Question.created_at)
    ).all()
    return [QuestionAnswerResponse.model_validate(item) for item in questions]


@router.post(
    "/proposals",
    response_model=QuestionProposalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Propose a question for servant review",
)
def propose_question(
    payload: QuestionProposalRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuestionProposalResponse:
    proposal = QuestionProposal(user_id=user.id, question=payload.question.strip())
    db.add(proposal)
    db.commit()
    return QuestionProposalResponse(
        id=proposal.id,
        status=proposal.status,
        message="The proposed question was submitted for review.",
    )


@router.get(
    "/know-me",
    response_model=list[KnowMeQuestionResponse],
    summary="List recent Know Me questions and answer status",
)
def list_know_me_questions(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[KnowMeQuestionResponse]:
    questions = db.scalars(
        select(KnowMeQuestion)
        .where(KnowMeQuestion.is_active.is_(True))
        .order_by(KnowMeQuestion.asked_at.desc())
        .limit(20)
    ).all()
    answered_ids = set(
        db.scalars(
            select(KnowMeAnswer.question_id).where(KnowMeAnswer.user_id == user.id)
        ).all()
    )
    current_question_id = get_current_know_me_question_id(db)
    return [
        serialize_know_me(item, answered_ids, current_question_id)
        for item in questions
    ]


@router.post(
    "/know-me/{question_id}/answers",
    response_model=SubmissionResult,
    status_code=status.HTTP_201_CREATED,
    summary="Answer a Know Me question and award eligible points once",
)
def submit_know_me_answer(
    question_id: str,
    payload: KnowMeAnswerRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubmissionResult:
    question = db.get(KnowMeQuestion, question_id)
    if not question or not question.is_active:
        raise AppError(404, "question_not_found", "The Know Me question was not found.")
    existing = db.scalar(
        select(KnowMeAnswer).where(
            KnowMeAnswer.user_id == user.id,
            KnowMeAnswer.question_id == question_id,
        )
    )
    if existing:
        raise AppError(409, "question_already_answered", "This question was already answered.")
    awarded = (
        question.points if question.id == get_current_know_me_question_id(db) else 0
    )
    answer = KnowMeAnswer(
        user_id=user.id,
        question_id=question.id,
        answer=payload.answer.strip(),
        points_awarded=awarded,
    )
    db.add(answer)
    user.profile.points += awarded
    db.commit()
    return SubmissionResult(
        id=answer.id,
        points_awarded=awarded,
        total_points=user.profile.points,
        message="Answer submitted successfully.",
    )
