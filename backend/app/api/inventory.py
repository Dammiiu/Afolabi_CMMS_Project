from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, require_role
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.user import User
from app.schemas.inventory import InventoryItemOut, InventoryItemCreate, InventoryAdjust

router = APIRouter()

@router.get("", response_model=List[InventoryItemOut])
def list_inventory(
    low_stock: Optional[bool] = False,
    db: Session = Depends(get_db),
    supervisor: User = Depends(require_role(["supervisor", "admin"]))
):
    query = db.query(InventoryItem)
    if low_stock:
        query = query.filter(InventoryItem.quantity_in_stock <= InventoryItem.reorder_threshold)
    return query.all()

@router.post("", response_model=InventoryItemOut)
def create_item(
    item_in: InventoryItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin", "supervisor"]))
):
    item = InventoryItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post("/{id}/adjust")
def adjust_inventory(
    id: int, adjust: InventoryAdjust,
    db: Session = Depends(get_db),
    supervisor: User = Depends(require_role(["supervisor", "admin"]))
):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item: raise HTTPException(404, "Not found")
    item.quantity_in_stock += adjust.quantity_change
    
    txn = InventoryTransaction(
        inventory_item_id=id,
        quantity_used=abs(adjust.quantity_change) if adjust.quantity_change < 0 else -adjust.quantity_change,
        logged_by=supervisor.id
    )
    db.add(txn)
    db.commit()
    db.refresh(item)
    return InventoryItemOut.model_validate(item)
