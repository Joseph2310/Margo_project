from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from types import SimpleNamespace
from typing import Any

import pytest

from app.exceptions import AppError
from app.mailer import deliver_verification_code, verification_email_content
from app.models import VerificationPurpose
from app.security import (
    consume_verification_code,
    create_jwt,
    create_password_reset_token,
    password_version,
    validate_password_reset_token,
)


class RecordingSmtp:
    messages: list[EmailMessage] = []
    started_tls = False
    login_credentials: tuple[str, str] | None = None

    def __init__(self, *_: object, **__: object) -> None:
        pass

    def __enter__(self) -> "RecordingSmtp":
        return self

    def __exit__(self, *_: object) -> None:
        pass

    def starttls(self) -> None:
        type(self).started_tls = True

    def login(self, username: str, password: str) -> None:
        type(self).login_credentials = (username, password)

    def send_message(self, message: EmailMessage) -> None:
        type(self).messages.append(message)


def test_password_reset_email_is_localized() -> None:
    english_subject, english_body = verification_email_content(
        VerificationPurpose.PASSWORD_RESET, "654321", "en"
    )
    arabic_subject, arabic_body = verification_email_content(
        VerificationPurpose.PASSWORD_RESET, "654321", "ar"
    )

    assert "password reset" in english_subject
    assert "654321" in english_body
    assert "إعادة تعيين كلمة المرور" in arabic_subject
    assert "654321" in arabic_body


def test_smtp_delivery_sends_the_otp(monkeypatch: pytest.MonkeyPatch) -> None:
    from app import mailer

    RecordingSmtp.messages = []
    RecordingSmtp.started_tls = False
    RecordingSmtp.login_credentials = None
    monkeypatch.setattr(mailer.settings, "smtp_host", "smtp.example.test")
    monkeypatch.setattr(mailer.settings, "smtp_port", 587)
    monkeypatch.setattr(mailer.settings, "smtp_starttls", True)
    monkeypatch.setattr(mailer.settings, "smtp_use_ssl", False)
    monkeypatch.setattr(mailer.settings, "smtp_username", "smtp-user")
    monkeypatch.setattr(mailer.settings, "smtp_password", "smtp-pass")
    monkeypatch.setattr(mailer.smtplib, "SMTP", RecordingSmtp)

    delivered = deliver_verification_code(
        "beneficiary@example.com",
        VerificationPurpose.PASSWORD_RESET,
        "654321",
        "en",
    )

    assert delivered is True
    assert RecordingSmtp.started_tls is True
    assert RecordingSmtp.login_credentials == ("smtp-user", "smtp-pass")
    assert len(RecordingSmtp.messages) == 1
    assert RecordingSmtp.messages[0]["To"] == "beneficiary@example.com"
    assert "654321" in RecordingSmtp.messages[0].get_content()


def test_missing_smtp_fails_when_codes_are_hidden(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app import mailer

    monkeypatch.setattr(mailer.settings, "smtp_host", None)
    monkeypatch.setattr(mailer.settings, "expose_verification_code", False)

    with pytest.raises(AppError) as error:
        deliver_verification_code(
            "beneficiary@example.com",
            VerificationPurpose.PASSWORD_RESET,
            "654321",
            "en",
        )

    assert error.value.code == "verification_delivery_unavailable"


def test_reset_token_becomes_invalid_after_password_changes() -> None:
    token, _ = create_password_reset_token(
        "beneficiary@example.com", "original-password-hash"
    )
    validate_password_reset_token(
        token, "beneficiary@example.com", "original-password-hash"
    )

    with pytest.raises(AppError) as error:
        validate_password_reset_token(
            token, "beneficiary@example.com", "updated-password-hash"
        )

    assert error.value.code == "invalid_reset_token"


def test_expired_reset_token_returns_password_recovery_error() -> None:
    password_hash_value = "original-password-hash"
    token, _, _ = create_jwt(
        "beneficiary@example.com",
        "password_reset",
        timedelta(seconds=-1),
        extra={"passwordVersion": password_version(password_hash_value)},
    )

    with pytest.raises(AppError) as error:
        validate_password_reset_token(
            token, "beneficiary@example.com", password_hash_value
        )

    assert error.value.code == "invalid_reset_token"


def test_expired_otp_is_rejected() -> None:
    expired_verification = SimpleNamespace(
        expires_at=datetime.now(timezone.utc) - timedelta(seconds=1),
        attempts=0,
    )

    class ExpiredCodeSession:
        def scalar(self, _: Any) -> SimpleNamespace:
            return expired_verification

    with pytest.raises(AppError) as error:
        consume_verification_code(
            ExpiredCodeSession(),  # type: ignore[arg-type]
            "beneficiary@example.com",
            VerificationPurpose.PASSWORD_RESET,
            "654321",
        )

    assert error.value.code == "verification_expired"
