from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import User
from app.schemas import (
    BeneficiaryProfileResponse,
    BeneficiaryProfileUpdate,
    WhatsAppGroupResponse,
)
from app.security import normalize_email


router = APIRouter(prefix="/profile", tags=["Profile"])


def serialize_profile(user: User) -> BeneficiaryProfileResponse:
    profile = user.profile
    return BeneficiaryProfileResponse(
        id=user.id,
        name=profile.name,
        birth_date=profile.birth_date,
        stage=profile.stage,
        address=profile.address,
        phone=profile.phone,
        whatsapp=profile.whatsapp,
        school=profile.school,
        class_saint_name=profile.class_saint_name,
        confession_father=profile.confession_father,
        talents=profile.talents,
        email=user.email,
        points=profile.points,
        attendance_qr_value=profile.attendance_qr_value,
        avatar_uri=profile.avatar_uri,
    )


@router.get("", response_model=BeneficiaryProfileResponse, summary="Get my profile")
def get_profile(user: User = Depends(get_current_user)) -> BeneficiaryProfileResponse:
    return serialize_profile(user)


@router.patch(
    "", response_model=BeneficiaryProfileResponse, summary="Update my editable profile fields"
)
def update_profile(
    payload: BeneficiaryProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BeneficiaryProfileResponse:
    email = normalize_email(str(payload.email))
    duplicate = db.scalar(select(User).where(User.email == email, User.id != user.id))
    if duplicate:
        raise AppError(409, "email_already_registered", "The email is already registered.")
    user.email = email
    profile = user.profile
    profile.name = payload.name
    profile.birth_date = payload.birth_date
    profile.stage = payload.stage
    profile.address = payload.address
    profile.phone = payload.phone
    profile.whatsapp = payload.whatsapp
    profile.school = payload.school
    profile.class_saint_name = payload.class_saint_name
    profile.confession_father = payload.confession_father or None
    profile.talents = payload.talents
    profile.avatar_uri = payload.avatar_uri
    db.commit()
    return serialize_profile(user)


@router.get(
    "/whatsapp-group",
    response_model=WhatsAppGroupResponse,
    summary="Get the configured Sunday-school WhatsApp group link",
)
def get_whatsapp_group(_: User = Depends(get_current_user)) -> WhatsAppGroupResponse:
    if not settings.whatsapp_group_url:
        raise AppError(
            404,
            "whatsapp_group_unavailable",
            "The WhatsApp group link is not configured.",
        )
    return WhatsAppGroupResponse(url=settings.whatsapp_group_url)
