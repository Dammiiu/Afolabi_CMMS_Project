from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, require_role
from app.models.work_order import WorkOrder, WOStatusEnum
from app.models.user import User, RoleEnum
from app.schemas.work_order import WorkOrderOut
from app.schemas.maintenance_record import MaintenanceRecordCreate
from app.services.workflow import complete_work_order
from pydantic import BaseModel

router = APIRouter()

class AssignTech(BaseModel):
    technician_id: int

@router.get("", response_model=dict)
def list_work_orders(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(WorkOrder)
    if user.role == RoleEnum.technician:
        query = query.filter(WorkOrder.assigned_technician_id == user.id)
    elif user.role == RoleEnum.requestor:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    total = query.count()
    wos = query.offset(skip).limit(limit).all()
    return {"items": [WorkOrderOut.model_validate(w) for w in wos], "total": total, "skip": skip, "limit": limit}

@router.post("/{id}/assign")
async def assign_work_order(id: int, assign_data: AssignTech, db: Session = Depends(get_db), supervisor: User = Depends(require_role(["supervisor", "admin"]))):
    wo = db.query(WorkOrder).filter(WorkOrder.id == id).first()
    if not wo: raise HTTPException(404, "Not found")
    wo.assigned_technician_id = assign_data.technician_id
    wo.status = WOStatusEnum.assigned
    db.commit()
    
    from app.services.notification_service import create_notification
    await create_notification(db, assign_data.technician_id, f"You have been assigned to Work Order #{wo.id}")
    return {"message": "Assigned successfully"}

@router.patch("/{id}/start")
async def start_work_order(id: int, db: Session = Depends(get_db), tech: User = Depends(require_role(["technician"]))):
    wo = db.query(WorkOrder).filter(WorkOrder.id == id, WorkOrder.assigned_technician_id == tech.id).first()
    if not wo: raise HTTPException(404, "Not found or not assigned to you")
    wo.status = WOStatusEnum.in_progress
    from app.models.maintenance_request import StatusEnum
    wo.request.status = StatusEnum.in_progress
    db.commit()
    return {"message": "Started"}

@router.patch("/{id}/complete")
async def complete_wo_endpoint(id: int, record_data: MaintenanceRecordCreate, db: Session = Depends(get_db), tech: User = Depends(require_role(["technician"]))):
    wo = db.query(WorkOrder).filter(WorkOrder.id == id, WorkOrder.assigned_technician_id == tech.id).first()
    if not wo: raise HTTPException(404, "Not found or not assigned to you")
    await complete_work_order(db, id, tech, record_data.model_dump())
    return {"message": "Completed successfully"}
