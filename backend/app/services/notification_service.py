from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.websocket.manager import manager
from app.websocket.events import WSEvents, build_event

async def create_notification(db: Session, user_id: int, message: str, related_request_id: int = None):
    notif = Notification(user_id=user_id, message=message, related_request_id=related_request_id)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    event = build_event(WSEvents.NEW_NOTIFICATION, {
        "id": notif.id,
        "message": notif.message,
        "related_request_id": notif.related_request_id,
        "created_at": notif.created_at.isoformat()
    })
    await manager.send_to_user(user_id, event)
    return notif

async def notify_role(db: Session, role: str, message: str, related_request_id: int = None):
    from app.models.user import User, RoleEnum
    role_enum = RoleEnum(role)
    users = db.query(User).filter(User.role == role_enum, User.is_active == True).all()
    
    notifs = []
    for user in users:
        notif = Notification(user_id=user.id, message=message, related_request_id=related_request_id)
        db.add(notif)
        notifs.append(notif)
    
    db.commit()
    
    event = build_event(WSEvents.NEW_NOTIFICATION, {
        "message": message,
        "related_request_id": related_request_id
    })
    await manager.broadcast_to_role(db, role, event)
