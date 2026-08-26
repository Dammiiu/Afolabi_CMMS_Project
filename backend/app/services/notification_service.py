import asyncio
import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User
from app.websocket.manager import manager
from app.websocket.events import WSEvents, build_event
from app.config import settings

def send_email_sync(to_email: str, subject: str, body: str):
    if not settings.SMTP_SERVER or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        # Simulated email sending for development/demonstration
        print(f"\n[{'='*40}]")
        print(f"SIMULATED EMAIL NOTIFICATION")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}")
        print(f"[{'='*40}]\n")
        return

    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = settings.FROM_EMAIL
        msg['To'] = to_email

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            print(f"Email successfully sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")

async def send_email(to_email: str, subject: str, body: str):
    await asyncio.to_thread(send_email_sync, to_email, subject, body)

async def create_notification(db: Session, user_id: int, message: str, related_request_id: int = None, send_email_alert: bool = False, email_subject: str = "AATU CMMS Alert"):
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
    
    if send_email_alert:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.email:
            asyncio.create_task(send_email(user.email, email_subject, message))
            
    return notif

async def notify_role(db: Session, role: str, message: str, related_request_id: int = None, send_email_alert: bool = False, email_subject: str = "AATU CMMS Alert"):
    from app.models.user import User, RoleEnum
    role_enum = RoleEnum(role)
    users = db.query(User).filter(User.role == role_enum, User.is_active == True).all()
    
    notifs = []
    for user in users:
        notif = Notification(user_id=user.id, message=message, related_request_id=related_request_id)
        db.add(notif)
        notifs.append(notif)
        
        if send_email_alert and user.email:
            asyncio.create_task(send_email(user.email, email_subject, message))
    
    db.commit()
    
    event = build_event(WSEvents.NEW_NOTIFICATION, {
        "message": message,
        "related_request_id": related_request_id
    })
    await manager.broadcast_to_role(db, role, event)
