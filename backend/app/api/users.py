from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.models.user import User, RoleEnum
from app.schemas.user import UserOut, UserCreateAdmin, UserAdminUpdate
from app.core.security import hash_password
from app.services.assignment import suggest_technicians
from app.schemas.user import TechnicianScoreOut

router = APIRouter()

@router.get("", response_model=dict)
def list_users(
    role: Optional[RoleEnum] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "supervisor"]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"items": [UserOut.model_validate(u) for u in users], "total": total, "skip": skip, "limit": limit}

@router.post("", response_model=UserOut)
def create_user(
    user_in: UserCreateAdmin,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        department=user_in.department,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        skill_tags=user_in.skill_tags
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/technicians/available", response_model=List[TechnicianScoreOut])
def get_available_technicians(
    category: str = Query(...),
    db: Session = Depends(get_db),
    supervisor: User = Depends(require_role(["supervisor", "admin"]))
):
    return suggest_technicians(db, category)

@router.patch("/{id}", response_model=UserOut)
def update_user(
    id: int,
    user_in: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for k, v in user_in.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
        
    db.commit()
    db.refresh(user)
    return user
