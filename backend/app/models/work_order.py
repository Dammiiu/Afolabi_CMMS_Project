import enum
from datetime import datetime, date
from sqlalchemy import Text, DateTime, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class WOStatusEnum(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"

class WOPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("maintenance_requests.id"), nullable=False)
    assigned_technician_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[WOStatusEnum] = mapped_column(Enum(WOStatusEnum), default=WOStatusEnum.pending)
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    priority: Mapped[WOPriorityEnum] = mapped_column(Enum(WOPriorityEnum), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    request = relationship("MaintenanceRequest", back_populates="work_orders")
    technician = relationship("User", back_populates="assigned_work_orders", foreign_keys=[assigned_technician_id])
    creator = relationship("User", back_populates="created_work_orders", foreign_keys=[created_by])
    maintenance_record = relationship("MaintenanceRecord", back_populates="work_order", uselist=False)
