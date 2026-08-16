from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.dependencies import get_db, get_current_user, require_role
from app.models.location import Location, BuildingTypeEnum
from app.models.user import User
from app.schemas.location import LocationOut, LocationCreate, LocationUpdate

router = APIRouter()

@router.get("", response_model=List[LocationOut])
def list_locations(
    building_type: Optional[BuildingTypeEnum] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Location)
    if building_type:
        query = query.filter(Location.building_type == building_type)
    return query.all()

@router.post("", response_model=LocationOut)
def create_location(
    location_in: LocationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    new_loc = Location(**location_in.model_dump())
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

@router.patch("/{id}", response_model=LocationOut)
def update_location(
    id: int,
    location_in: LocationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc: raise HTTPException(404, "Not found")
    for k, v in location_in.model_dump(exclude_unset=True).items():
        setattr(loc, k, v)
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/{id}")
def delete_location(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc: raise HTTPException(404, "Not found")
    # Soft check
    if loc.requests:
        raise HTTPException(400, "Location has linked requests")
    db.delete(loc)
    db.commit()
    return {"message": "Deleted"}
