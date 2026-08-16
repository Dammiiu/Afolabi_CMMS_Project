from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    related_request_id: Optional[int]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
