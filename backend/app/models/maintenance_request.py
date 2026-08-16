import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class CategoryEnum(str, enum.Enum):
    electrical = "electrical"
    plumbing = "plumbing"
    hvac = "hvac"
    structural = "structural"
    it = "it"
    other = "other"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class StatusEnum(str, enum.Enum):
    submitted = "submitted"
    triaged = "triaged"
    approved = "approved"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    requestor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    category: Mapped[CategoryEnum] = mapped_column(Enum(CategoryEnum), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[PriorityEnum] = mapped_column(Enum(PriorityEnum), default=PriorityEnum.medium)
    status: Mapped[StatusEnum] = mapped_column(Enum(StatusEnum), default=StatusEnum.submitted)
    photo_attachment: Mapped[str | None] = mapped_column(String(500), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requestor = relationship("User", back_populates="requests", foreign_keys=[requestor_id])
    location = relationship("Location", back_populates="requests")
    work_orders = relationship("WorkOrder", back_populates="request")
    notifications = relationship("Notification", back_populates="related_request")
