import smtplib
from email.message import EmailMessage

from app.config import settings
from app.exceptions import AppError
from app.localization import Language
from app.models import VerificationPurpose


def verification_email_content(
    purpose: VerificationPurpose,
    code: str,
    language: Language,
) -> tuple[str, str]:
    if language == "ar":
        labels = {
            VerificationPurpose.REGISTRATION: "تسجيل الحساب",
            VerificationPurpose.ACTIVATION: "تفعيل الحساب",
            VerificationPurpose.PASSWORD_RESET: "إعادة تعيين كلمة المرور",
        }
        return (
            f"كود {labels[purpose]} - تطبيق المستفيدين",
            (
                f"كود التحقق الخاص بطلب {labels[purpose]} هو: {code}\n\n"
                f"تنتهي صلاحية الكود خلال "
                f"{settings.verification_code_ttl_seconds // 60} دقائق.\n"
                "إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة."
            ),
        )

    labels = {
        VerificationPurpose.REGISTRATION: "registration",
        VerificationPurpose.ACTIVATION: "account activation",
        VerificationPurpose.PASSWORD_RESET: "password reset",
    }
    return (
        f"Beneficiaries {labels[purpose]} code",
        (
            f"Your verification code for {labels[purpose]} is: {code}\n\n"
            f"This code expires in "
            f"{settings.verification_code_ttl_seconds // 60} minutes.\n"
            "If you did not request this code, you can ignore this email."
        ),
    )


def deliver_verification_code(
    email: str,
    purpose: VerificationPurpose,
    code: str,
    language: Language,
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

    subject, body = verification_email_content(purpose, code, language)
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message["Auto-Submitted"] = "auto-generated"
    message.set_content(body)

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
