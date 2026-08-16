from pydantic import BaseModel
from typing import List

class CategoryStat(BaseModel):
    category: str
    count: int

class LocationStat(BaseModel):
    location_name: str
    count: int

class StatusStat(BaseModel):
    status: str
    count: int

class TechnicianWorkload(BaseModel):
    technician_name: str
    active_orders: int
    completed_orders: int

class MonthlyTrend(BaseModel):
    month: str
    submitted: int
    completed: int

class ResponseTimeTrend(BaseModel):
    month: str
    avg_response_hours: float
