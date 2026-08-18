from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppError
from app.models import Notification, User
from app.schemas import MessageResponse, NotificationResponse


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=list[NotificationResponse],
    summary="List my notifications newest first",
)
def list_notifications(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[NotificationResponse]:
    notifications = db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
    ).all()
    return [NotificationResponse.model_validate(item) for item in notifications]


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark one notification as read",
)
def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NotificationResponse:
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
    )
    if not notification:
        raise AppError(404, "notification_not_found", "The notification was not found.")
    notification.is_read = True
    db.commit()
    return NotificationResponse.model_validate(notification)


@router.patch(
    "/read-all",
    response_model=MessageResponse,
    summary="Mark all my notifications as read",
)
def mark_all_notifications_read(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> MessageResponse:
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    db.commit()
    return MessageResponse(message="All notifications marked as read.")
