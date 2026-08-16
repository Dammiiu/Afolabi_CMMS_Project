from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_role
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut
from app.models.user import User

router = APIRouter()

@router.get("", response_model=dict)
def get_audit_logs(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    total = query.count()
    logs = query.offset(skip).limit(limit).all()
    return {"items": [AuditLogOut.model_validate(l) for l in logs], "total": total, "skip": skip, "limit": limit}
