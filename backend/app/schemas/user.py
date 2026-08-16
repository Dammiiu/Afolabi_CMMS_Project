from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    skill_tags: Optional[List[str]] = None

class UserCreate(UserBase):
    password: str

class UserCreateAdmin(UserCreate):
    role: RoleEnum

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

class UserAdminUpdate(UserUpdate):
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    skill_tags: Optional[List[str]] = None

class UserOut(UserBase):
    id: int
    role: RoleEnum
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserOut

class TechnicianScoreOut(BaseModel):
    technician_id: int
    technician_name: str
    skill_match_score: float
    workload_score: float
    total_score: float
