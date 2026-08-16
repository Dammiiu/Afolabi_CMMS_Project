import pytest
from app.services.triage import triage_request
from app.models.location import Location, BuildingTypeEnum

def test_triage_base_priority(db_session):
    # Test base category priority
    res = triage_request(db_session, "plumbing", 1, "Leaking tap")
    assert res.suggested_priority == "high"
    
    res = triage_request(db_session, "it", 1, "Internet down")
    assert res.suggested_priority == "medium"
    
def test_triage_location_modifier(db_session):
    # Create a lab location
    loc = Location(id=1, name="Lab 1", building_type=BuildingTypeEnum.lab)
    db_session.add(loc)
    db_session.commit()
    
    # IT is normally medium. Lab modifier pushes it to high
    res = triage_request(db_session, "it", 1, "Internet down")
    assert res.suggested_priority == "high"

def test_triage_keyword_escalation(db_session):
    res = triage_request(db_session, "other", 2, "There is a sparking wire causing smoke")
    assert res.suggested_priority == "critical"
