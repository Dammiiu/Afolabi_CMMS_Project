from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
from app.models.user import User

router = APIRouter()

@router.get("", response_model=dict)
def get_notifications(
    unread_only: bool = False,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc())
    
    total = query.count()
    notifs = query.offset(skip).limit(limit).all()
    return {"items": [NotificationOut.model_validate(n) for n in notifs], "total": total, "skip": skip, "limit": limit}

@router.patch("/{id}/read")
def read_notification(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == user.id).first()
    if not notif: raise HTTPException(404, "Not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked read"}

@router.patch("/read-all")
def read_all(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All marked read"}
