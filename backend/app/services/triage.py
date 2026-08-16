from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.maintenance_request import MaintenanceRequest, StatusEnum
from app.schemas.maintenance_request import TriageResultOut

def triage_request(db: Session, category: str, location_id: int, description: str) -> TriageResultOut:
    # 1. Base priority
    priority_map = {
        "electrical": "high",
        "plumbing": "high",
        "hvac": "medium",
        "structural": "high",
        "it": "medium",
        "other": "low"
    }
    base_priority = priority_map.get(category.value if hasattr(category, 'value') else category, "medium")
    
    priority_levels = ["low", "medium", "high", "critical"]
    current_level = priority_levels.index(base_priority)

    # 2. Location modifier
    from app.models.location import Location
    location = db.query(Location).filter(Location.id == location_id).first()
    if location and location.building_type.value in ["lab", "hostel"]:
        current_level = min(current_level + 1, 3)

    # 3. Keyword detection
    desc_lower = description.lower()
    critical_keywords = ['sparking','fire','flooding','collapse','leak','burst','exposed wire','short circuit','electrocution','smoke']
    if any(keyword in desc_lower for keyword in critical_keywords):
        current_level = 3 # critical

    suggested_priority = priority_levels[current_level]

    # 4. Duplicate check
    forty_eight_hours_ago = datetime.utcnow() - timedelta(hours=48)
    duplicate = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.location_id == location_id,
        MaintenanceRequest.category == category,
        MaintenanceRequest.status.in_([StatusEnum.submitted, StatusEnum.triaged, StatusEnum.approved, StatusEnum.in_progress]),
        MaintenanceRequest.submitted_at >= forty_eight_hours_ago
    ).first()

    reason = f"Base priority for {category} is {base_priority}. "
    if current_level > priority_levels.index(base_priority):
        reason += "Escalated due to location or critical keywords."
    
    return TriageResultOut(
        suggested_priority=suggested_priority,
        is_duplicate=duplicate is not None,
        duplicate_request_id=duplicate.id if duplicate else None,
        priority_reason=reason
    )
