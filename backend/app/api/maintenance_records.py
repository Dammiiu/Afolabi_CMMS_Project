from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_role
from app.models.maintenance_record import MaintenanceRecord
from app.schemas.maintenance_record import MaintenanceRecordOut
from app.models.user import User

router = APIRouter()

@router.get("", response_model=dict)
def list_records(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    supervisor: User = Depends(require_role(["supervisor", "admin"]))
):
    query = db.query(MaintenanceRecord)
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    return {"items": [MaintenanceRecordOut.model_validate(r) for r in records], "total": total, "skip": skip, "limit": limit}
