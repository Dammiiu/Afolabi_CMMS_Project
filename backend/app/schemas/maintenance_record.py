from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PartUsed(BaseModel):
    item_id: int
    name: str
    quantity: int

class MaintenanceRecordCreate(BaseModel):
    completion_notes: str
    parts_used: Optional[List[PartUsed]] = None
    time_spent_minutes: Optional[int] = None

class MaintenanceRecordOut(BaseModel):
    id: int
    work_order_id: int
    technician_id: int
    completion_notes: Optional[str]
    parts_used: Optional[List[PartUsed]]
    time_spent_minutes: Optional[int]
    completed_at: datetime

    class Config:
        from_attributes = True
