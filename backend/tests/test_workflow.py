import pytest
from app.services.workflow import process_submission, approve_request, complete_work_order
from app.models.maintenance_request import MaintenanceRequest
from app.models.user import User, RoleEnum
from app.models.location import Location, BuildingTypeEnum
from app.models.inventory import InventoryItem

@pytest.mark.asyncio
async def test_full_workflow(db_session):
    # Setup
    user = User(id=1, full_name="Req", email="req@a.com", password_hash="123", role=RoleEnum.requestor)
    tech = User(id=2, full_name="Tech", email="tech@a.com", password_hash="123", role=RoleEnum.technician)
    sup = User(id=3, full_name="Sup", email="sup@a.com", password_hash="123", role=RoleEnum.supervisor)
    loc = Location(id=1, name="Loc", building_type=BuildingTypeEnum.hostel)
    item = InventoryItem(id=1, name="Bulb", category="Electrical", unit="pc", quantity_in_stock=10)
    db_session.add_all([user, tech, sup, loc, item])
    db_session.commit()
    
    # 1. Process submission
    req = MaintenanceRequest(requestor_id=1, location_id=1, category="electrical", description="Dark")
    req, triage = await process_submission(db_session, req, user)
    
    assert req.status.value == "triaged"
    
    # 2. Approve request
    wo = await approve_request(db_session, req.id, sup, priority_override="high")
    assert req.status.value == "approved"
    assert wo.request_id == req.id
    
    # 3. Complete WO
    comp_data = {
        "completion_notes": "Done",
        "parts_used": [{"item_id": 1, "name": "Bulb", "quantity": 2}],
        "time_spent_minutes": 30
    }
    await complete_work_order(db_session, wo.id, tech, comp_data)
    
    assert wo.status.value == "completed"
    assert req.status.value == "completed"
    assert db_session.query(InventoryItem).get(1).quantity_in_stock == 8
