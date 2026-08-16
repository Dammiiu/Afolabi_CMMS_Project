import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class RoleEnum(str, enum.Enum):
    requestor = "requestor"
    technician = "technician"
    supervisor = "supervisor"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), default=RoleEnum.requestor, nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    skill_tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    requests = relationship("MaintenanceRequest", back_populates="requestor", foreign_keys="MaintenanceRequest.requestor_id")
    assigned_work_orders = relationship("WorkOrder", back_populates="technician", foreign_keys="WorkOrder.assigned_technician_id")
    created_work_orders = relationship("WorkOrder", back_populates="creator", foreign_keys="WorkOrder.created_by")
    notifications = relationship("Notification", back_populates="user")
