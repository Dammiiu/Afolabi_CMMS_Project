from app.database import SessionLocal, engine, Base
from app.models.user import User, RoleEnum
from app.models.location import Location, BuildingTypeEnum
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.maintenance_request import MaintenanceRequest, CategoryEnum, PriorityEnum, StatusEnum
from app.models.work_order import WorkOrder, WOStatusEnum, WOPriorityEnum
from app.models.maintenance_record import MaintenanceRecord
from app.core.security import hash_password
from datetime import datetime, timedelta

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clean database before seeding to ensure fresh state
    db.query(MaintenanceRecord).delete()
    db.query(InventoryTransaction).delete()
    db.query(WorkOrder).delete()
    db.query(MaintenanceRequest).delete()
    db.query(InventoryItem).delete()
    db.query(Location).delete()
    db.query(User).delete()
    db.commit()

    # Create Users
    pw = hash_password("User@123")
    admin_pw = hash_password("Admin@123")
    super_pw = hash_password("Super@123")
    tech_pw = hash_password("Tech@123")

    users = [
        User(full_name="Engr. Adebayo Olatunji", email="admin@aatu.edu.ng", password_hash=admin_pw, role=RoleEnum.admin),
        User(full_name="Mrs. Folake Adeyemi", email="folake.adeyemi@aatu.edu.ng", password_hash=super_pw, role=RoleEnum.supervisor),
        User(full_name="Mr. Ibrahim Yusuf", email="ibrahim.yusuf@aatu.edu.ng", password_hash=super_pw, role=RoleEnum.supervisor),
        User(full_name="Tunde Bello", email="tunde.bello@aatu.edu.ng", password_hash=tech_pw, role=RoleEnum.technician, skill_tags=['electrical', 'hvac']),
        User(full_name="Chidi Okonkwo", email="chidi.okonkwo@aatu.edu.ng", password_hash=tech_pw, role=RoleEnum.technician, skill_tags=['plumbing', 'structural']),
        User(full_name="Amina Suleiman", email="amina.suleiman@aatu.edu.ng", password_hash=tech_pw, role=RoleEnum.technician, skill_tags=['electrical', 'it']),
        User(full_name="Kehinde Ajayi", email="kehinde.ajayi@aatu.edu.ng", password_hash=tech_pw, role=RoleEnum.technician, skill_tags=['plumbing', 'hvac']),
        User(full_name="Blessing Eze", email="blessing.eze@aatu.edu.ng", password_hash=tech_pw, role=RoleEnum.technician, skill_tags=['structural', 'other']),
        
        # Staff and students
        User(full_name="Oluwaseun Adeyinka", email="student1@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor),
        User(full_name="Fatimah Balogun", email="student2@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor),
        User(full_name="Emeka Nwosu", email="student3@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor),
        User(full_name="Aisha Mohammed", email="student4@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor),
        User(full_name="David Okafor", email="student5@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor),
        User(full_name="Dr. Ngozi Obi", email="staff1@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor, department="Civil Engineering"),
        User(full_name="Mr. Sola Akinwale", email="staff2@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor, department="Architecture"),
        User(full_name="Mrs. Kemi Bakare", email="staff3@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor, department="Building Technology"),
        User(full_name="Prof. Aliyu Danjuma", email="staff4@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor, department="Electrical Engineering"),
        User(full_name="Dr. Grace Omotayo", email="staff5@aatu.edu.ng", password_hash=pw, role=RoleEnum.requestor, department="Admin")
    ]
    db.add_all(users)
    db.commit()

    # Get IDs for relationships
    users_db = db.query(User).all()
    req_users = [u.id for u in users_db if u.role == RoleEnum.requestor]
    tech_bello = [u.id for u in users_db if u.full_name == "Tunde Bello"][0]
    tech_chidi = [u.id for u in users_db if u.full_name == "Chidi Okonkwo"][0]
    tech_amina = [u.id for u in users_db if u.full_name == "Amina Suleiman"][0]
    tech_kehinde = [u.id for u in users_db if u.full_name == "Kehinde Ajayi"][0]
    tech_blessing = [u.id for u in users_db if u.full_name == "Blessing Eze"][0]
    supervisor_folake = [u.id for u in users_db if u.full_name == "Mrs. Folake Adeyemi"][0]

    # Locations
    locs = [
        Location(name="Male Hostel Block A", building_type=BuildingTypeEnum.hostel, block="Block A"),
        Location(name="Engineering Lab 2", building_type=BuildingTypeEnum.lab, block="Block C"),
        Location(name="Main Admin Block", building_type=BuildingTypeEnum.admin_block),
        Location(name="Faculty of Environmental Sciences", building_type=BuildingTypeEnum.academic_block, block="Block D")
    ]
    db.add_all(locs)
    db.commit()
    locs_db = db.query(Location).all()
    loc_ids = [l.id for l in locs_db]

    # Inventory
    items = [
        InventoryItem(name="LED Light Bulbs", category="Electrical", unit="pieces", quantity_in_stock=45, reorder_threshold=10),
        InventoryItem(name="PVC Pipe Fittings", category="Plumbing", unit="pieces", quantity_in_stock=30, reorder_threshold=8),
        InventoryItem(name="Circuit Breakers (20A)", category="Electrical", unit="pieces", quantity_in_stock=12, reorder_threshold=5),
        InventoryItem(name="PVC Pipes (1 inch)", category="Plumbing", unit="meters", quantity_in_stock=25, reorder_threshold=10),
        InventoryItem(name="Emulsion Paint (White)", category="General", unit="buckets", quantity_in_stock=8, reorder_threshold=5),
        InventoryItem(name="HVAC Filters", category="HVAC", unit="pieces", quantity_in_stock=3, reorder_threshold=5),
        InventoryItem(name="Network Cables (Cat6)", category="IT", unit="meters", quantity_in_stock=50, reorder_threshold=15),
        InventoryItem(name="Door Hinges", category="Structural", unit="pairs", quantity_in_stock=2, reorder_threshold=5),
        InventoryItem(name="Water Faucets", category="Plumbing", unit="pieces", quantity_in_stock=15, reorder_threshold=5),
        InventoryItem(name="Electrical Wire (2.5mm)", category="Electrical", unit="meters", quantity_in_stock=40, reorder_threshold=20)
    ]
    db.add_all(items)
    db.commit()

    # Seed 5 "manual era" requests (resolved very slowly - average 7 days to simulate old system)
    manual_data = [
        (CategoryEnum.electrical, "Exposed wires hanging from building block A ceiling.", PriorityEnum.critical, 10, tech_bello, 9),
        (CategoryEnum.plumbing, "Severe water leakage in male hostel bathroom flooding the area.", PriorityEnum.high, 8, tech_chidi, 7),
        (CategoryEnum.hvac, "Lecture room AC not powering on in Environmental Sciences block.", PriorityEnum.medium, 14, tech_kehinde, 13),
        (CategoryEnum.structural, "Door locks broken in room 103 Admin block.", PriorityEnum.medium, 6, tech_blessing, 5),
        (CategoryEnum.it, "Internet cable cut in Engineering lab computer systems.", PriorityEnum.high, 7, tech_amina, 7)
    ]

    now = datetime.utcnow()
    for cat, desc, prio, days_delay, tech, completion_delay in manual_data:
        req_date = now - timedelta(days=90)
        req = MaintenanceRequest(
            requestor_id=req_users[0],
            location_id=loc_ids[0],
            category=cat,
            description=f"[MANUAL ERA] {desc}",
            priority=prio,
            status=StatusEnum.closed,
            submitted_at=req_date,
            updated_at=req_date + timedelta(days=days_delay)
        )
        db.add(req)
        db.commit()

        wo = WorkOrder(
            request_id=req.id,
            assigned_technician_id=tech,
            created_by=supervisor_folake,
            status=WOStatusEnum.closed,
            priority=WOPriorityEnum(prio.value),
            created_at=req_date + timedelta(days=days_delay - 2),
            scheduled_date=(req_date + timedelta(days=days_delay - 2)).date()
        )
        db.add(wo)
        db.commit()

        rec = MaintenanceRecord(
            work_order_id=wo.id,
            technician_id=tech,
            completion_notes="Resolved manually after supervisor radio dispatch.",
            time_spent_minutes=120,
            completed_at=req_date + timedelta(days=days_delay)
        )
        db.add(rec)
        db.commit()

    # Seed 10 completed/closed automated system requests (resolved fast - 1-2 days)
    auto_completed_data = [
        (CategoryEnum.electrical, "Ceiling fan socket spark in Room 204.", PriorityEnum.high, tech_bello),
        (CategoryEnum.plumbing, "Tap head missing in kitchen sink.", PriorityEnum.low, tech_chidi),
        (CategoryEnum.it, "Server rack offline due to faulty ethernet port.", PriorityEnum.high, tech_amina),
        (CategoryEnum.hvac, "Thermostat unit display blank in Admin 2nd floor.", PriorityEnum.medium, tech_kehinde),
        (CategoryEnum.structural, "Door hinge loose on lab main doors.", PriorityEnum.low, tech_blessing),
        (CategoryEnum.electrical, "Fluorescent tubes flickering in Room 301.", PriorityEnum.low, tech_bello),
        (CategoryEnum.plumbing, "Water closet tank running constantly.", PriorityEnum.medium, tech_chidi),
        (CategoryEnum.hvac, "Condenser unit making loud rattling noise.", PriorityEnum.medium, tech_kehinde),
        (CategoryEnum.structural, "Window glass cracked block C corridor.", PriorityEnum.low, tech_blessing),
        (CategoryEnum.it, "Wifi router in block D lobby is unresponsive.", PriorityEnum.medium, tech_amina)
    ]

    for idx, (cat, desc, prio, tech) in enumerate(auto_completed_data):
        req_date = now - timedelta(days=30 - idx * 2)
        req = MaintenanceRequest(
            requestor_id=req_users[idx % len(req_users)],
            location_id=loc_ids[idx % len(loc_ids)],
            category=cat,
            description=desc,
            priority=prio,
            status=StatusEnum.completed,
            submitted_at=req_date,
            updated_at=req_date + timedelta(hours=36)
        )
        db.add(req)
        db.commit()

        wo = WorkOrder(
            request_id=req.id,
            assigned_technician_id=tech,
            created_by=supervisor_folake,
            status=WOStatusEnum.completed,
            priority=WOPriorityEnum(prio.value),
            created_at=req_date + timedelta(hours=2),
            scheduled_date=(req_date + timedelta(hours=2)).date()
        )
        db.add(wo)
        db.commit()

        rec = MaintenanceRecord(
            work_order_id=wo.id,
            technician_id=tech,
            completion_notes="Resolved quickly using CMMS dispatch logging.",
            time_spent_minutes=90,
            completed_at=req_date + timedelta(hours=36)
        )
        db.add(rec)
        db.commit()

    # Seed 5 in-progress requests (with work orders assigned)
    in_progress_data = [
        (CategoryEnum.electrical, "Classroom projector power inlet sparking.", PriorityEnum.critical, tech_bello),
        (CategoryEnum.plumbing, "Restroom drainage pipe leaking in administrative office.", PriorityEnum.high, tech_chidi),
        (CategoryEnum.it, "VoIP desk phone has no dial tone in registrar office.", PriorityEnum.medium, tech_amina),
        (CategoryEnum.hvac, "Exhaust system failing in Engineering Lab 2.", PriorityEnum.high, tech_kehinde),
        (CategoryEnum.structural, "Ceiling drywall sagging block A hallway.", PriorityEnum.medium, tech_blessing)
    ]

    for idx, (cat, desc, prio, tech) in enumerate(in_progress_data):
        req_date = now - timedelta(days=2)
        req = MaintenanceRequest(
            requestor_id=req_users[idx % len(req_users)],
            location_id=loc_ids[idx % len(loc_ids)],
            category=cat,
            description=desc,
            priority=prio,
            status=StatusEnum.in_progress,
            submitted_at=req_date,
            updated_at=req_date
        )
        db.add(req)
        db.commit()

        wo = WorkOrder(
            request_id=req.id,
            assigned_technician_id=tech,
            created_by=supervisor_folake,
            status=WOStatusEnum.in_progress,
            priority=WOPriorityEnum(prio.value),
            created_at=req_date + timedelta(hours=1),
            scheduled_date=req_date.date()
        )
        db.add(wo)
        db.commit()

    # Seed 3 approved requests (work orders created, pending assignment)
    approved_data = [
        (CategoryEnum.electrical, "Outdoor street lights not turning on near Hostel Block A.", PriorityEnum.medium),
        (CategoryEnum.plumbing, "Water reservoir overflow pipe constantly dripping.", PriorityEnum.medium),
        (CategoryEnum.structural, "Main gate latch mechanism jammed.", PriorityEnum.low)
    ]

    for idx, (cat, desc, prio) in enumerate(approved_data):
        req_date = now - timedelta(hours=12)
        req = MaintenanceRequest(
            requestor_id=req_users[idx % len(req_users)],
            location_id=loc_ids[idx % len(loc_ids)],
            category=cat,
            description=desc,
            priority=prio,
            status=StatusEnum.approved,
            submitted_at=req_date,
            updated_at=req_date
        )
        db.add(req)
        db.commit()

        wo = WorkOrder(
            request_id=req.id,
            assigned_technician_id=None,
            created_by=supervisor_folake,
            status=WOStatusEnum.pending,
            priority=WOPriorityEnum(prio.value),
            created_at=req_date + timedelta(hours=1)
        )
        db.add(wo)
        db.commit()

    # Seed 2 submitted requests (awaiting triage)
    submitted_data = [
        (CategoryEnum.electrical, "Sparking distribution board panel inside electrical room.", PriorityEnum.critical),
        (CategoryEnum.plumbing, "Leaking flush valve causing flooding in Environmental Sciences toilet.", PriorityEnum.high)
    ]

    for idx, (cat, desc, prio) in enumerate(submitted_data):
        req_date = now - timedelta(hours=2)
        req = MaintenanceRequest(
            requestor_id=req_users[idx % len(req_users)],
            location_id=loc_ids[idx % len(loc_ids)],
            category=cat,
            description=desc,
            priority=prio,
            status=StatusEnum.submitted,
            submitted_at=req_date,
            updated_at=req_date
        )
        db.add(req)
        db.commit()

    print("Seed complete! 25 maintenance tickets successfully created.")

if __name__ == "__main__":
    seed_db()
