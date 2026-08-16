import enum
from datetime import datetime
from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class BuildingTypeEnum(str, enum.Enum):
    hostel = "hostel"
    lab = "lab"
    admin_block = "admin_block"
    academic_block = "academic_block"
    faculty = "faculty"

class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    building_type: Mapped[BuildingTypeEnum] = mapped_column(Enum(BuildingTypeEnum), nullable=False)
    block: Mapped[str | None] = mapped_column(String(50), nullable=True)
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    requests = relationship("MaintenanceRequest", back_populates="location")
