from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    category: str
    unit: str
    reorder_threshold: int = 5

class InventoryItemCreate(InventoryItemBase):
    quantity_in_stock: int = 0

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    reorder_threshold: Optional[int] = None

class InventoryItemOut(InventoryItemBase):
    id: int
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class InventoryAdjust(BaseModel):
    quantity_change: int
    reason: Optional[str] = None

class InventoryTransactionOut(BaseModel):
    id: int
    inventory_item_id: int
    work_order_id: Optional[int]
    quantity_used: int
    logged_by: int
    logged_at: datetime
    
    class Config:
        from_attributes = True
