from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import BeneficiaryProfile, User, VerificationPurpose
from app.schemas import (
    AuthSession,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegistrationRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    VerificationChallenge,
    VerificationRequest,
    VerificationResult,
)
from app.security import (
    consume_verification_code,
    create_password_reset_token,
    create_verification_challenge,
    hash_secret,
    issue_auth_session,
    normalize_email,
    revoke_all_user_sessions,
    revoke_refresh_token,
    rotate_refresh_token,
    validate_password_reset_token,
    verify_secret,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=VerificationChallenge,
    status_code=status.HTTP_201_CREATED,
    summary="Register a beneficiary and send a verification code",
)
def register(
    payload: RegistrationRequest, db: Session = Depends(get_db)
) -> VerificationChallenge:
    email = normalize_email(str(payload.email))
    user = db.scalar(select(User).where(User.email == email))
    if user and user.is_verified:
        raise AppError(409, "email_already_registered", "The email is already registered.")
    if not user:
        user = User(email=email, password_hash=hash_secret(payload.password))
        db.add(user)
        db.flush()
        profile = BeneficiaryProfile(
            user_id=user.id,
            attendance_qr_value=f"{user.id}:sunday-school-attendance",
            points=0,
            name=payload.name,
            birth_date=payload.birth_date,
            stage=payload.stage,
            address=payload.address,
            phone=payload.phone,
            whatsapp=payload.whatsapp,
            school=payload.school,
            class_saint_name=payload.class_saint_name,
            confession_father=payload.confession_father or None,
            talents=payload.talents,
        )
        db.add(profile)
    else:
        user.password_hash = hash_secret(payload.password)
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
    db.commit()
    return create_verification_challenge(
        db, email, VerificationPurpose.REGISTRATION
    )


@router.post(
    "/verification/verify",
    response_model=VerificationResult,
    summary="Verify registration, activation, or password-reset code",
)
def verify_code(
    payload: VerificationRequest, db: Session = Depends(get_db)
) -> VerificationResult:
    email = normalize_email(str(payload.email))
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise AppError(400, "verification_invalid", "The verification code is invalid.")
    consume_verification_code(db, email, payload.mode, payload.code)
    if payload.mode == VerificationPurpose.PASSWORD_RESET:
        reset_token, expires_in = create_password_reset_token(email)
        db.commit()
        return VerificationResult(
            mode=payload.mode,
            password_reset_token=reset_token,
            expires_in=expires_in,
        )
    user.is_verified = True
    session = issue_auth_session(db, user)
    db.commit()
    return VerificationResult(mode=payload.mode, session=session)


@router.post(
    "/verification/resend",
    response_model=VerificationChallenge,
    summary="Resend a verification code",
)
def resend_code(
    payload: ResendVerificationRequest, db: Session = Depends(get_db)
) -> VerificationChallenge:
    email = normalize_email(str(payload.email))
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise AppError(404, "account_not_found", "The account was not found.")
    return create_verification_challenge(db, email, payload.mode)


@router.post("/login", response_model=AuthSession, summary="Log in with email and password")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthSession:
    user = db.scalar(
        select(User).where(User.email == normalize_email(str(payload.email)))
    )
    if not user or not verify_secret(payload.password, user.password_hash):
        raise AppError(401, "invalid_credentials", "Email or password is incorrect.")
    if not user.is_active:
        raise AppError(403, "account_disabled", "The account is disabled.")
    if not user.is_verified:
        raise AppError(403, "account_not_verified", "The account is not verified.")
    session = issue_auth_session(db, user)
    db.commit()
    return session


@router.post(
    "/password/forgot",
    response_model=VerificationChallenge,
    summary="Request a password-reset verification code",
)
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> VerificationChallenge:
    email = normalize_email(str(payload.email))
    user = db.scalar(select(User).where(User.email == email, User.is_active.is_(True)))
    if user:
        return create_verification_challenge(
            db, email, VerificationPurpose.PASSWORD_RESET
        )
    return VerificationChallenge(
        email=email,
        mode=VerificationPurpose.PASSWORD_RESET,
        expires_in_seconds=600,
        message="If the account exists, a verification code has been generated.",
    )


@router.post(
    "/password/reset",
    response_model=MessageResponse,
    summary="Set a new password using a verified reset token",
)
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> MessageResponse:
    email = normalize_email(str(payload.email))
    validate_password_reset_token(payload.reset_token, email)
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise AppError(404, "account_not_found", "The account was not found.")
    user.password_hash = hash_secret(payload.password)
    revoke_all_user_sessions(db, user.id)
    db.commit()
    return MessageResponse(message="Password updated successfully.")


@router.post(
    "/password/change",
    response_model=MessageResponse,
    summary="Change the authenticated beneficiary password",
)
def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    if not verify_secret(payload.current_password, user.password_hash):
        raise AppError(400, "current_password_invalid", "Current password is incorrect.")
    user.password_hash = hash_secret(payload.password)
    revoke_all_user_sessions(db, user.id)
    db.commit()
    return MessageResponse(message="Password updated successfully.")


@router.post(
    "/refresh", response_model=AuthSession, summary="Rotate a refresh token"
)
def refresh_session(
    payload: RefreshTokenRequest, db: Session = Depends(get_db)
) -> AuthSession:
    return rotate_refresh_token(db, payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Log out")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)) -> None:
    revoke_refresh_token(db, payload.refresh_token)
