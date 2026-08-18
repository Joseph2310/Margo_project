import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import AppError
from app.mailer import deliver_verification_code
from app.models import RefreshSession, User, VerificationCode, VerificationPurpose
from app.schemas import AuthSession, VerificationChallenge


password_hash = PasswordHash.recommended()


def aware_utc(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_secret(value: str) -> str:
    return password_hash.hash(value)


def verify_secret(value: str, hashed_value: str) -> bool:
    return password_hash.verify(value, hashed_value)


def create_jwt(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    *,
    extra: dict[str, Any] | None = None,
) -> tuple[str, str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    jti = secrets.token_urlsafe(24)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": now,
        "exp": expires_at,
    }
    if extra:
        payload.update(extra)
    token = jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return token, jti, expires_at


def decode_jwt(token: str, expected_type: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except InvalidTokenError as exc:
        raise AppError(401, "invalid_token", "The authentication token is invalid.") from exc
    if payload.get("type") != expected_type:
        raise AppError(401, "invalid_token_type", "The token cannot be used here.")
    return payload


def issue_auth_session(db: Session, user: User) -> AuthSession:
    access_token, _, _ = create_jwt(
        user.id,
        "access",
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token, refresh_jti, refresh_expires_at = create_jwt(
        user.id,
        "refresh",
        timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(
        RefreshSession(
            id=refresh_jti,
            user_id=user.id,
            expires_at=refresh_expires_at,
        )
    )
    db.flush()
    return AuthSession(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        beneficiary_id=user.id,
    )


def rotate_refresh_token(db: Session, token: str) -> AuthSession:
    payload = decode_jwt(token, "refresh")
    session = db.get(RefreshSession, str(payload.get("jti", "")))
    now = datetime.now(timezone.utc)
    if not session or session.revoked_at or aware_utc(session.expires_at) <= now:
        raise AppError(401, "refresh_token_revoked", "The session has expired.")
    user = db.get(User, str(payload.get("sub", "")))
    if not user or not user.is_active or not user.is_verified:
        raise AppError(401, "account_unavailable", "The account is unavailable.")
    session.revoked_at = now
    result = issue_auth_session(db, user)
    db.commit()
    return result


def revoke_refresh_token(db: Session, token: str) -> None:
    payload = decode_jwt(token, "refresh")
    session = db.get(RefreshSession, str(payload.get("jti", "")))
    if session and not session.revoked_at:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()


def create_verification_challenge(
    db: Session, email: str, purpose: VerificationPurpose
) -> VerificationChallenge:
    email = normalize_email(email)
    db.execute(
        update(VerificationCode)
        .where(
            VerificationCode.email == email,
            VerificationCode.purpose == purpose,
            VerificationCode.consumed_at.is_(None),
        )
        .values(consumed_at=datetime.now(timezone.utc))
    )
    code = (
        settings.dev_verification_code
        if settings.app_env != "production"
        else f"{secrets.randbelow(1_000_000):06d}"
    )
    db.add(
        VerificationCode(
            email=email,
            purpose=purpose,
            code_hash=hash_secret(code),
            expires_at=datetime.now(timezone.utc)
            + timedelta(seconds=settings.verification_code_ttl_seconds),
        )
    )
    delivered = deliver_verification_code(email, purpose, code)
    db.commit()
    return VerificationChallenge(
        email=email,
        mode=purpose,
        expires_in_seconds=settings.verification_code_ttl_seconds,
        message=(
            "A verification code has been sent."
            if delivered
            else "A verification code has been generated for development."
        ),
        verification_code=code if settings.expose_verification_code else None,
    )


def consume_verification_code(
    db: Session, email: str, purpose: VerificationPurpose, code: str
) -> None:
    email = normalize_email(email)
    verification = db.scalar(
        select(VerificationCode)
        .where(
            VerificationCode.email == email,
            VerificationCode.purpose == purpose,
            VerificationCode.consumed_at.is_(None),
        )
        .order_by(VerificationCode.created_at.desc())
    )
    now = datetime.now(timezone.utc)
    if not verification or aware_utc(verification.expires_at) <= now:
        raise AppError(400, "verification_expired", "The verification code has expired.")
    if verification.attempts >= settings.verification_max_attempts:
        raise AppError(429, "verification_locked", "Too many invalid attempts.")
    if not verify_secret(code, verification.code_hash):
        verification.attempts += 1
        db.commit()
        raise AppError(400, "verification_invalid", "The verification code is invalid.")
    verification.consumed_at = now
    db.flush()


def create_password_reset_token(email: str) -> tuple[str, int]:
    expires_in = settings.password_reset_token_expire_minutes * 60
    token, _, _ = create_jwt(
        normalize_email(email),
        "password_reset",
        timedelta(seconds=expires_in),
    )
    return token, expires_in


def validate_password_reset_token(token: str, email: str) -> None:
    payload = decode_jwt(token, "password_reset")
    if payload.get("sub") != normalize_email(email):
        raise AppError(401, "invalid_reset_token", "The reset token is invalid.")


def revoke_all_user_sessions(db: Session, user_id: str) -> None:
    db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.user_id == user_id,
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(timezone.utc))
    )
