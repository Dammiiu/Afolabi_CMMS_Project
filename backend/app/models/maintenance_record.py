from datetime import datetime
from sqlalchemy import Text, JSON, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    work_order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), unique=True, nullable=False)
    technician_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    completion_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    parts_used: Mapped[list | None] = mapped_column(JSON, nullable=True)
    time_spent_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    work_order = relationship("WorkOrder", back_populates="maintenance_record")
    technician = relationship("User", foreign_keys=[technician_id])
