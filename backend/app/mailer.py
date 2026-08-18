import smtplib
from email.message import EmailMessage

from app.config import settings
from app.exceptions import AppError
from app.models import VerificationPurpose


def deliver_verification_code(
    email: str, purpose: VerificationPurpose, code: str
) -> bool:
    """Deliver a code through SMTP, or return False for exposed local codes."""
    if not settings.smtp_host:
        if settings.expose_verification_code:
            return False
        raise AppError(
            503,
            "verification_delivery_unavailable",
            "Verification email delivery is not configured.",
        )

    labels = {
        VerificationPurpose.REGISTRATION: "registration",
        VerificationPurpose.ACTIVATION: "account activation",
        VerificationPurpose.PASSWORD_RESET: "password reset",
    }
    message = EmailMessage()
    message["Subject"] = f"Beneficiaries {labels[purpose]} code"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message.set_content(
        "Your Beneficiaries verification code is "
        f"{code}. It expires in {settings.verification_code_ttl_seconds // 60} minutes. "
        "If you did not request this code, you can ignore this email."
    )

    try:
        smtp_type = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP
        with smtp_type(
            settings.smtp_host,
            settings.smtp_port,
            timeout=settings.smtp_timeout_seconds,
        ) as smtp:
            if settings.smtp_starttls and not settings.smtp_use_ssl:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password or "")
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise AppError(
            503,
            "verification_delivery_failed",
            "The verification email could not be delivered. Please try again.",
        ) from exc
    return True
