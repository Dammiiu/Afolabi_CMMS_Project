from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.work_order import WOStatusEnum, WOPriorityEnum

class WorkOrderBase(BaseModel):
    request_id: int
    priority: WOPriorityEnum
    notes: Optional[str] = None

class WorkOrderCreate(WorkOrderBase):
    assigned_technician_id: Optional[int] = None
    scheduled_date: Optional[date] = None

class WorkOrderUpdate(BaseModel):
    status: Optional[WOStatusEnum] = None
    notes: Optional[str] = None
    scheduled_date: Optional[date] = None
    assigned_technician_id: Optional[int] = None

from app.schemas.maintenance_request import MaintenanceRequestOut
from app.schemas.user import UserOut

class WorkOrderOut(WorkOrderBase):
    id: int
    assigned_technician_id: Optional[int]
    created_by: int
    status: WOStatusEnum
    scheduled_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    request: Optional[MaintenanceRequestOut] = None
    technician: Optional[UserOut] = None
    
    class Config:
        from_attributes = True
