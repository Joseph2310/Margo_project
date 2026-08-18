from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import AppError
from app.models import User
from app.security import decode_jwt


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise AppError(401, "authentication_required", "Authentication is required.")
    payload = decode_jwt(credentials.credentials, "access")
    user = db.get(User, str(payload.get("sub", "")))
    if not user or not user.is_active or not user.is_verified:
        raise AppError(401, "account_unavailable", "The account is unavailable.")
    return user
