from app.services.assignment import suggest_technicians
from app.models.user import User, RoleEnum
from app.models.work_order import WorkOrder, WOStatusEnum

def test_suggest_technicians(db_session):
    tech1 = User(id=1, full_name="Tech A", email="a@a.com", password_hash="123", role=RoleEnum.technician, skill_tags=["electrical"])
    tech2 = User(id=2, full_name="Tech B", email="b@a.com", password_hash="123", role=RoleEnum.technician, skill_tags=["electrical", "hvac"])
    tech3 = User(id=3, full_name="Tech C", email="c@a.com", password_hash="123", role=RoleEnum.technician, skill_tags=["plumbing"])
    
    db_session.add_all([tech1, tech2, tech3])
    db_session.commit()
    
    # Add work order to tech1 to increase workload
    wo1 = WorkOrder(id=1, request_id=1, created_by=1, assigned_technician_id=1, status=WOStatusEnum.in_progress, priority="high")
    wo2 = WorkOrder(id=2, request_id=2, created_by=1, assigned_technician_id=1, status=WOStatusEnum.in_progress, priority="high")
    db_session.add_all([wo1, wo2])
    db_session.commit()

    suggestions = suggest_technicians(db_session, "electrical")
    assert len(suggestions) == 3
    # tech2 should have higher score than tech1 because tech1 has 2 active WOs
    assert suggestions[0].technician_id == 2
    assert suggestions[1].technician_id == 1
    assert suggestions[2].technician_id == 3
