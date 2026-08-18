from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Suggestion, User
from app.schemas import SuggestionRequest, SuggestionResponse


router = APIRouter(prefix="/suggestions", tags=["Suggestions"])


@router.post(
    "",
    response_model=SuggestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Sunday-school suggestions and hymn rating",
)
def submit_suggestion(
    payload: SuggestionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SuggestionResponse:
    suggestion = Suggestion(
        user_id=user.id,
        general_suggestion=payload.general_suggestion.strip(),
        lesson_suggestion=payload.lesson_suggestion.strip(),
        hymn_suggestion=payload.hymn_suggestion.strip(),
        hymn_rating=payload.hymn_rating,
        anonymous=payload.anonymous,
    )
    db.add(suggestion)
    db.commit()
    return SuggestionResponse(
        id=suggestion.id, message="Suggestions submitted successfully."
    )
