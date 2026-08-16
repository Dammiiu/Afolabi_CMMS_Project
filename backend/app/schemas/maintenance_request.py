from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.maintenance_request import CategoryEnum, PriorityEnum, StatusEnum

class MaintenanceRequestBase(BaseModel):
    location_id: int
    category: CategoryEnum
    description: str

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    description: Optional[str] = None
    photo_attachment: Optional[str] = None

class TriageUpdate(BaseModel):
    priority: PriorityEnum
    status: StatusEnum
    reason: Optional[str] = None

from app.schemas.location import LocationOut
from app.schemas.user import UserOut

class MaintenanceRequestOut(MaintenanceRequestBase):
    id: int
    requestor_id: int
    priority: PriorityEnum
    status: StatusEnum
    photo_attachment: Optional[str] = None
    submitted_at: datetime
    updated_at: datetime
    location: Optional[LocationOut] = None
    requestor: Optional[UserOut] = None
    
    class Config:
        from_attributes = True

class TriageResultOut(BaseModel):
    suggested_priority: str
    is_duplicate: bool
    duplicate_request_id: Optional[int]
    priority_reason: str
