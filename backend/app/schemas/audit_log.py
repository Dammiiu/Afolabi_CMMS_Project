from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    details: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True
