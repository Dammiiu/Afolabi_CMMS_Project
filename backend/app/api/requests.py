from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.models.maintenance_request import MaintenanceRequest, StatusEnum, CategoryEnum
from app.models.user import User, RoleEnum
from app.schemas.maintenance_request import MaintenanceRequestCreate, MaintenanceRequestOut, TriageUpdate
from app.services.workflow import process_submission, approve_request
import uuid
import os
from app.config import settings
import aiofiles

router = APIRouter()

@router.post("", response_model=dict)
async def create_request(
    request_in: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    req = MaintenanceRequest(
        requestor_id=user.id,
        location_id=request_in.location_id,
        category=request_in.category,
        description=request_in.description
    )
    req, triage_info = await process_submission(db, req, user)
    return {"request": MaintenanceRequestOut.model_validate(req), "triage": triage_info.model_dump()}

@router.get("", response_model=dict)
def list_requests(
    status: Optional[StatusEnum] = None,
    category: Optional[CategoryEnum] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(MaintenanceRequest)
    if user.role == RoleEnum.requestor:
        query = query.filter(MaintenanceRequest.requestor_id == user.id)
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if category:
        query = query.filter(MaintenanceRequest.category == category)
        
    total = query.count()
    reqs = query.offset(skip).limit(limit).all()
    return {"items": [MaintenanceRequestOut.model_validate(r) for r in reqs], "total": total, "skip": skip, "limit": limit}

@router.get("/{id}", response_model=MaintenanceRequestOut)
def get_request(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == id).first()
    if not req: raise HTTPException(404, "Not found")
    if user.role == RoleEnum.requestor and req.requestor_id != user.id:
        raise HTTPException(403, "Forbidden")
    return req

@router.patch("/{id}/triage", response_model=dict)
async def triage_request_endpoint(
    id: int,
    triage_in: TriageUpdate,
    db: Session = Depends(get_db),
    supervisor: User = Depends(require_role(["supervisor", "admin"]))
):
    if triage_in.status == StatusEnum.approved:
        wo = await approve_request(db, id, supervisor, triage_in.priority)
        return {"message": "Approved and Work Order created", "work_order_id": wo.id}
    else:
        req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == id).first()
        if not req: raise HTTPException(404, "Not found")
        req.status = triage_in.status
        req.priority = triage_in.priority
        db.commit()
        return {"message": f"Status updated to {req.status.value}"}

@router.post("/{id}/upload-photo")
async def upload_photo(id: int, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == id).first()
    if not req or (req.requestor_id != user.id and user.role.value not in ["admin", "supervisor"]):
        raise HTTPException(404, "Not found")
        
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    
    async with aiofiles.open(path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    req.photo_attachment = f"/uploads/{filename}"
    db.commit()
    return {"photo_url": req.photo_attachment}
