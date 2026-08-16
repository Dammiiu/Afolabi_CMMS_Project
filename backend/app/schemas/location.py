from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.location import BuildingTypeEnum

class LocationBase(BaseModel):
    name: str
    building_type: BuildingTypeEnum
    block: Optional[str] = None
    room: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    building_type: Optional[BuildingTypeEnum] = None
    block: Optional[str] = None
    room: Optional[str] = None

class LocationOut(LocationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
