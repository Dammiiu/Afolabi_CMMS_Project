from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity_in_stock: Mapped[int] = mapped_column(Integer, default=0)
    reorder_threshold: Mapped[int] = mapped_column(Integer, default=5)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("InventoryTransaction", back_populates="item")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id"), nullable=False)
    work_order_id: Mapped[int | None] = mapped_column(ForeignKey("work_orders.id"), nullable=True)
    quantity_used: Mapped[int] = mapped_column(Integer, nullable=False) # pos = consume, neg = restock
    logged_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    item = relationship("InventoryItem", back_populates="transactions")
    logged_by_user = relationship("User", foreign_keys=[logged_by])
